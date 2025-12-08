# Gaze Estimation Data Collection Platform

> **See also:** [EVALUATION_DISCUSSION.md](./EVALUATION_DISCUSSION.md) - Discussion on evaluation approaches (random points vs cards as ground truth)

## Project Overview

This project is a web-based data collection platform designed to gather gaze estimation training data. It uses a memory card matching game as the visual stimulus while simultaneously recording:

1. **Screen/game display** - What the user is looking at
2. **Webcam feed** - The user's face/eyes
3. **Click events with timestamps** - User interactions correlated with video timestamps

The collected data can be used to train machine learning models for gaze estimation, allowing the prediction of where a user is looking on screen based on their facial/eye features.

## Gaze Estimation System Architecture

### Two-Model Approach

The system uses a hybrid approach combining a pre-trained 3D gaze estimation model with a personalized mapper model:

1. **3D Gaze Estimation Model (Pre-trained)**
   - Pre-trained on large-scale datasets
   - Outputs a **3D gaze vector** based on facial/eye features
   - Provides robust gaze direction estimation
   - Does not require per-user training

2. **Mapper Model (Linear Regression)**
   - Maps the 3D gaze vector to screen pixel coordinates
   - Based on the observation that the relationship between gaze vector and screen pixel is **locally linear** in laptop use scenarios
   - Personalized per user through calibration
   - Continuously updated during usage

### Calibration Strategy

#### Initial Calibration (9-Point Grid)

- User completes 9-point calibration at the start (3×3 grid at 5%/50%/95% positions)
- These 9 anchor points establish the initial mapping function
- Trains the mapper model using simple linear regression
- Provides baseline accuracy for gaze-to-pixel mapping

#### Dynamic Calibration (Continuous Adaptation)

**Problem:** User head pose inevitably shifts during computer use, making initial calibration data less accurate over time.

**Solution:** The mapper model is continuously retrained using:

- **9 anchor points** from initial calibration (persistent)
- **Recent N clicks** from gameplay (rolling window)

This approach accounts for natural head movement and maintains calibration accuracy throughout the session.

### Click Data Collection

During gameplay, two types of click data are collected:

#### 1. Explicit Clicks (Ground Truth for Evaluation)

- **Purpose:** Model accuracy evaluation
- **Method:** Calibration overlay appears at interval T during gameplay showing a point at a random screen position
- **Gamification:** Themed as "Dungeon Spirit" challenge - interrupts player's concentration as part of game lore
- **User action:** User clicks on the displayed point to "banish the spirit"
- **Data use:** Serves as ground truth to compare against model's predicted gaze position
- **Frequency:** Every T = 15 seconds (for ~15 minute game = ~60 evaluation points)
- **Position:** Fully randomized or stratified random (not limited to 9-point grid)
- **UX Features:**
  - Countdown timer in navbar: "Next Spirit: 12s" (builds anticipation)
  - Thematic presentation: "The Dungeon Spirit appears!" with fitting visuals
  - Makes interruption feel like game mechanic rather than technical requirement
  - Audio cue (optional): spirit sound effect when appearing
- **Note:** These clicks are NOT used for dynamic calibration to avoid biasing evaluation

#### 2. Implicit Clicks (Dynamic Calibration Training Data)

- **Purpose:** Continuous mapper model adaptation
- **Method:** Regular gameplay clicks (card flips, UI interactions)
- **Recording:** Use global `document.click` listener to capture accurate screen coordinates
- **Assumption:** User is looking at what they're clicking
- **Data use:** Added to training set for mapper model retraining
- **Window:** Most recent N clicks (rolling window)
- **Note:** Combined with 9 initial calibration points for continuous model updates
- **Important:** Screen coordinates (x, y pixels) are primary data. Card ID is also stored for offline analysis (comparing click position vs card center as training targets)

### Recording & Data Pipeline Flow

**Continuous Recording Timeline (Option A - CHOSEN):**

```
User clicks "Play Game"
  ↓
Request webcam + screen recording permissions
  ↓
Show webcam preview (position check)
  - User sees live webcam feed
  - Guidance: "Center your face" / "Move closer" / "Ensure good lighting"
  - Face detection overlay (optional): bounding box to confirm face is visible
  - [Continue] button enabled when ready
  ↓
User clicks "Continue" (confirms positioning is good)
  ↓
START RECORDING (webcam + screen) ← 📹 Recording begins here
  ↓
Show calibration intro dialog
  ↓
Initial Calibration (9 points, ~30-45 seconds)
  ↓
Calibration complete → Transition to game (recording continues)
  ↓
Gameplay starts (recording ongoing)
  ↓
Every implicit click → Track for training data
Every 15s → Show explicit calibration point (evaluation data)
  ↓
Game ends (all matches found)
  ↓
STOP RECORDING ← 🛑 Recording ends here
  ↓
Export data (videos + JSON)
```

**Why continuous recording from calibration through gameplay:**

1. **Temporal consistency** - Calibration data and gameplay data are from the same session with minimal time gap
2. **Prevents calibration drift** - If user calibrates, leaves, returns later, their head pose may have changed significantly
3. **Complete dataset** - Webcam frames during calibration are ESSENTIAL for extracting gaze vectors of the 9 anchor points
4. **Seamless experience** - User perceives calibration and game as one continuous flow
5. **Single timeline** - Easier synchronization with one recording start timestamp
6. **Data validity** - Calibration remains accurate throughout gameplay (no context switching)

**Why webcam preview before recording:**

1. **Data quality assurance** - Ensure face is visible, centered, and well-lit before collecting data
2. **User positioning** - Allow user to adjust their seating position, distance from camera
3. **Technical validation** - Verify webcam is working properly before starting
4. **User confidence** - User knows their setup is correct before proceeding
5. **Prevents wasted sessions** - Catch issues (face not visible, poor lighting) before recording starts

**Recording duration:** `calibration_time + game_time` (~45s + 15min ≈ 16 minutes total)
**Preview duration:** ~10-30 seconds (user adjusts position as needed)

### Data Pipeline Summary

```
1. Start recording → Initial Calibration (9 points, webcam frames captured)
2. Train initial mapper model (using gaze vectors from calibration frames)
3. Gameplay starts (recording continues) → Track all clicks
4. Every implicit click → Add to training set → Retrain mapper (9 anchors + recent N clicks)
5. Every T=15s interval → Show explicit calibration point → Record as ground truth
6. Game ends → Stop recording
7. Post-processing → Extract gaze vectors → Train/evaluate mapper → Generate metrics
```

### Key Assumptions

- **Locally linear relationship:** Gaze vector to screen pixel mapping is approximately linear in typical laptop viewing scenarios
- **Click-gaze alignment:** Users are looking at UI elements when they click them (reasonable for card matching game)
- **Head pose drift:** User head position changes gradually during use, requiring continuous adaptation
- **Anchor stability:** Initial 9-point calibration provides stable reference points throughout session

### Technical Assessment & Recommendations

#### ✅ Strengths of This Approach

1. **Smart Model Architecture**
   - Separating the 3D gaze estimator from the mapper is elegant and practical
   - Using a pre-trained model eliminates the need for massive per-user datasets
   - Linear mapper is computationally cheap and can be retrained in real-time

2. **Dynamic Calibration Strategy**
   - Addresses the critical problem of head pose drift
   - Rolling window of recent N clicks is a good balance between adaptation and stability
   - Maintaining 9 anchor points prevents drift over time

3. **Dual Click Types**
   - Clear separation between training data (implicit) and evaluation data (explicit) is methodologically sound
   - Explicit clicks provide unbiased ground truth for model validation
   - Implicit clicks provide natural, continuous calibration data

4. **Locally Linear Assumption**
   - Well-justified for laptop viewing scenarios (typical viewing distance, limited head movement range)
   - Makes the problem tractable with simple linear regression
   - Fast inference and retraining

#### 💡 Recommendations & Considerations

1. **Explicit Click Frequency (Interval T)**
   - **Chosen value:** T = 15 seconds
   - **Rationale:** 15-minute game duration → ~60 explicit clicks for robust evaluation
   - **UX improvement:** Display countdown timer in navbar ("Next Check: 12s")
   - **Benefits:** Sets expectations, reduces surprise/frustration, creates predictable rhythm
   - **Visual feedback:** Subtle pulse animation when timer < 3s as heads-up

2. **Rolling Window Size (N clicks)**
   - **Recommendation:** N = 20-50 clicks
   - Too small → sensitive to outlier clicks, unstable mapper
   - Too large → slow adaptation to head pose changes, memory overhead
   - Consider time-based window (e.g., last 2 minutes) instead of count-based

3. **Click Quality Filtering**
   - **Consideration:** Not all implicit clicks are equal
   - Fast double-clicks might have poor click-gaze alignment
   - Misclicks (user correcting wrong card flip) should potentially be filtered
   - **Suggestion:** Add click metadata (time since last click, whether card was matched, etc.)

4. **Explicit Click Presentation**
   - **Recommendation:** Use the same calibration overlay component (already implemented)
   - **Position generation:** Fully randomized or stratified random (NOT limited to 9-point grid)
   - **Stratified approach:** Divide screen into 3×3 regions, randomize within each for good coverage
   - **Example:** `x = region_col * 33.33 + 5 + random() * 23.33` (10-90% range)
   - **Brief warning:** Optional countdown or fade-in to prepare user
   - **Smooth integration:** Timer provides advance notice, no surprise interruptions

5. **Data Recording Strategy**
   - **Click coordinates:** Use global `document.click` event listener for accurate screen x, y pixels
   - **What to store:** Screen pixel coordinates (absolute position) + timestamp + click type + cardId (for implicit clicks)
   - **Why card IDs for implicit:** Enables offline analysis comparing click position vs card center as training targets
   - **Synchronization:** Timestamp relative to video recording start for frame alignment
   - **Explicit clicks:** Store click position AND target position (ground truth), no cardId (not clicking cards)
   - **Implicit clicks:** Store click position + cardId reference (enables click-to-center distance analysis)

6. **Model Retraining Frequency**
   - **Options:**
     - A) After every implicit click (real-time adaptation)
     - B) Every M clicks (batch updates, e.g., M=5)
     - C) Time-based (every 10 seconds)
   - **Recommendation:** Start with B (every 5 clicks) for balance between adaptation speed and computational cost

7. **Edge Cases to Handle**
   - **Head pose extremes:** If gaze vector is far from calibration range, mapper may extrapolate poorly
   - **Outlier detection:** Some clicks may be accidental or have poor gaze alignment → consider RANSAC or robust regression
   - **Cold start:** First few clicks after calibration have no implicit training data yet
   - **Game end:** Store final mapper model state and all calibration data for offline analysis

8. **Data Export Considerations**
   - Export both the raw gaze vectors AND the mapper predictions for each frame
   - Include full training history (when mapper was retrained, with which points)
   - Allow researchers to replay/retrain mapper offline with different hyperparameters

#### 🎯 Implementation Priority

1. **High Priority (Core Functionality)**
   - Explicit click overlay at interval T
   - Click type labeling (explicit/implicit)
   - Basic mapper retraining with 9 anchors + N recent clicks

2. **Medium Priority (Quality Improvements)**
   - Click quality filtering
   - Adaptive interval T based on head pose stability
   - Randomized explicit click positions

3. **Low Priority (Nice to Have)**
   - Advanced outlier detection
   - Multiple mapper model comparison
   - Real-time accuracy visualization

#### 📊 Data Format (Browser Collection)

**Important:** Gaze vector extraction and mapper inference happen offline in Python. Browser only collects raw data.

```json
{
  "sessionId": "uuid-v4",
  "participant": {
    "name": "Optional Name",
    "ageRange": "26-35",
    "gender": "Female",
    "wearingGlasses": true,
    "wearingContacts": false
  },
  "webcamVideo": "path/to/webcam.webm",
  "screenVideo": "path/to/screen.webm",
  "recordingStartTime": 1234567890,
  "recordingDuration": 945000,
  "screenResolution": {
    "width": 1920,
    "height": 1080
  },
  "gameMetadata": {
    "duration": 847,
    "totalMoves": 64,
    "totalMatches": 16
  },

  "cardPositions": [
    {
      "cardId": "fruits-1-1",
      "x": 120,
      "y": 200,
      "width": 80,
      "height": 100,
      "centerX": 160,
      "centerY": 250
    }
    // ... all cards
    // Positions recorded at game start, remain constant throughout session
    // Useful for offline analysis: check accuracy in card regions vs empty space
  ],

  "initialCalibration": {
    "startTimestamp": 0,
    "endTimestamp": 45000,
    "points": [
      {
        "pointId": "top-left",
        "x": 5,
        "y": 5,
        "screenX": 48,
        "screenY": 32,
        "timestamp": 150,
        "videoTimestamp": 5000
      }
      // ... 8 more points (each ~5s apart during calibration)
    ]
  },

  "gameStartTimestamp": 50000,

  "clicks": [
    {
      "id": "click-001",
      "timestamp": 1523,
      "videoTimestamp": 1523,
      "type": "explicit",
      "screenX": 450,
      "screenY": 320,
      "targetX": 448,
      "targetY": 318
    },
    {
      "id": "click-002",
      "timestamp": 2841,
      "videoTimestamp": 2841,
      "type": "implicit",
      "screenX": 325,
      "screenY": 450,
      "targetX": null,
      "targetY": null,
      "cardId": "fruits-5-1"
    }
  ],

  "gameEndTimestamp": 945000
}
```

**Python Offline Processing Pipeline:**

1. Load videos (webcam + screen) - single continuous recording from calibration through game end
2. Extract gaze vectors from webcam frames using 3D gaze model for entire recording duration
3. Extract initial calibration gaze vectors (9 anchor points from videoTimestamps 0-45s)
4. Train initial mapper model using 9 calibration points
5. For each mapper training event during gameplay:
   - Collect gaze vectors for 9 anchors + recent N implicit clicks
   - **Choose training target:** Use click position `(screenX, screenY)` OR card center `(cardCenterX, cardCenterY)` from cardPositions lookup
   - Train linear regression mapper
   - **Compare approaches:** Train two mappers (click-based vs center-based) to see which performs better
6. For each explicit click:
   - Get gaze vector at timestamp
   - Apply mapper → prediction
   - Compare with targetX/targetY → compute error
7. Generate evaluation metrics and compare training target approaches

**Key benefit of continuous recording:** Calibration frames and gameplay frames are from same session, ensuring head pose consistency and calibration validity.

#### 🔬 Overall Assessment

Your approach is **technically sound and well-thought-out**. The separation of concerns (3D gaze estimator + mapper), dynamic calibration strategy, and dual click types show strong understanding of the gaze estimation problem. The locally linear assumption is appropriate for the use case, and the implementation plan is practical and achievable.

**Main risks to watch:**

- Click-gaze alignment assumption may not hold perfectly (users sometimes look ahead/around before clicking)
- Mapper drift if implicit clicks are consistently biased
- User frustration with explicit click interruptions

**Success factors:**

- Keep explicit click interruptions minimal and smooth
- Implement robust outlier filtering for implicit clicks
- Maintain good UX so users don't try to "game" the system
- Collect rich metadata for offline analysis and improvement

## Current State

### ✅ Completed

- **Base memory game** - Fully functional card matching game with 16 pairs
- **Game mechanics** - Card flipping, matching detection, win condition
- **Statistics tracking** - Moves, matches, time elapsed
- **Single difficulty** - Simplified from 6 difficulties to 1 (16 pairs)
- **Dialog system** - Hook-based dialog system for alerts, confirmations, prompts, and selections
- **Themed UI** - Consistent amber/stone color scheme with animations
- **Routing** - Simple 2-page structure (menu → game)
- **Consent flow** - Detailed consent dialog with data collection information, localStorage persistence, and gated game access
- **Calibration overlay** - Interactive 3x3 grid calibration system with pulse animations and progress tracking

### 🔨 In Progress

- Nothing currently in progress

## TODO List

### 1. Consent Flow ✅

**Priority:** High
**Complexity:** Low
**Status:** COMPLETED

- [x] Create consent dialog with detailed information about data collection
- [x] Explain what will be recorded (webcam, screen, clicks)
- [x] Add "I agree" button and consent state management
- [x] Store consent decision in localStorage with timestamp
- [x] Gate game access behind consent (Play Game button disabled until consent given)
- [x] Add About button (labeled "1. ABOUT") to show consent information
- [x] Rename game button to "2. PLAY GAME"
- [x] Implement fullscreen requirement for data collection
- [x] Prompt user to enter fullscreen after consent
- [x] Gate game access behind both consent AND fullscreen
- [x] Monitor fullscreen state during gameplay with event listeners
- [x] Pause game and show overlay when user exits fullscreen
- [x] Allow resumption when user returns to fullscreen

**Files created/modified:**

- `src/lib/consent.ts` - Consent state management with Zustand and localStorage persistence, includes fullscreen requirement in technical requirements
- `src/routes/index.tsx` - Updated main menu with two-step flow (About → Play Game), fullscreen prompt after consent, dual-gate for Play Game button
- `src/components/fullscreen-monitor.tsx` - Fullscreen monitoring component that shows warning overlay when user exits fullscreen during gameplay
- `src/routes/game.tsx` - Integrated fullscreen monitor to pause timer and disable interactions when fullscreen is exited

**UX Flow:**

1. User visits site → sees About (enabled) and Play Game (disabled)
2. User clicks About → reads consent information → clicks "I Agree and Consent"
3. Fullscreen prompt dialog appears automatically after consent
4. User enters fullscreen → Play Game button becomes enabled
5. During gameplay: fullscreen state is continuously monitored via event listeners
6. If user exits fullscreen (ESC key, etc.) → game pauses, overlay appears, interactions disabled
7. User clicks "Return to Fullscreen" → game resumes from where it was paused

**Data Integrity Protection:**

- Play Game button only enables when BOTH consent is given AND fullscreen is active
- Game timer pauses when fullscreen is exited
- Card interactions are disabled when fullscreen is exited
- Visual status indicators show both consent and fullscreen status
- Clear messaging explains why fullscreen is required for data quality

---

### 2. Participant Information Collection ⚠️ (In Progress)

**Priority:** High
**Complexity:** Low

**Purpose:** Collect demographic and technical metadata for ML research and model fairness analysis.

- [ ] Create participant information dialog (shown after consent, before webcam preview)
- [ ] Generate unique session ID automatically (UUID v4)
- [ ] Collect demographic data:
  - **Name** (optional, for researcher tracking)
  - **Age range** (18-25, 26-35, 36-45, 46-55, 56-65, 65+)
  - **Gender** (Male, Female, Non-binary, Prefer not to say)
  - **Wearing glasses?** (Yes/No) - Critical: glasses affect eye appearance
  - **Wearing contact lenses?** (Yes/No) - Critical: contacts affect pupil detection
  - **Dominant eye** (Left/Right/Not sure) - Optional, for advanced analysis
  - **Vision correction** (None, Nearsighted, Farsighted, Astigmatism, Other)
- [ ] Validation: Only age range, gender, and glasses/contacts are required
- [ ] Store participant info in session metadata
- [ ] Add to exported data JSON
- [ ] Privacy: Explain data will be used for research, stored securely

**Why this matters for gaze estimation:**

- **Glasses:** Reflections, lens distortion, frame occlusion affect eye tracking
- **Contacts:** Can affect pupil appearance and corneal reflections
- **Age:** Eye characteristics (pupil size, eyelid position) vary with age
- **Demographics:** Essential for analyzing model fairness and bias across groups
- **Vision correction:** Affects how users look at screen (head angle, distance)

**Data format:**

```json
{
  "participant": {
    "sessionId": "uuid-v4",
    "name": "Optional Name",
    "ageRange": "26-35",
    "gender": "Female",
    "wearingGlasses": true,
    "wearingContacts": false,
    "dominantEye": "Right",
    "visionCorrection": "Nearsighted"
  }
}
```

**Files to create/modify:**

- `src/lib/participant.ts` - Participant data management and types
- `src/components/participant-info-dialog.tsx` - Form dialog component
- `src/routes/index.tsx` - Show dialog after consent, before webcam preview

**UX Flow:**

```
Consent → Participant Info Dialog → Webcam Preview → Calibration → Game
```

---

### 3. Webcam Access & Preview ⚠️ (In Progress)

**Priority:** High
**Complexity:** Medium

**Purpose:** Ensure data quality by validating webcam setup before recording starts.

- [ ] Request webcam permission using `navigator.mediaDevices.getUserMedia()`
- [ ] Show webcam preview screen before calibration (user positioning validation)
- [ ] Display live webcam feed with visual guidance overlay
- [ ] Provide positioning instructions:
  - "Center your face in the frame"
  - "Make sure your eyes are clearly visible"
  - "Ensure good lighting"
  - "Sit at a comfortable distance (~50-70cm from screen)"
- [ ] Optional: Implement face detection for automatic validation
  - ✅ Green border: Face detected and well-positioned
  - ⚠️ Yellow border: Face detected but not centered
  - ❌ Red border: No face detected
- [ ] Enable "Continue" button when ready (after face detected for 2+ seconds if using detection)
- [ ] Detect if webcam is not available and show error with troubleshooting steps
- [ ] Allow user to select which camera if multiple are available
- [ ] Store camera stream for recording (don't stop stream between preview and recording)

**User Flow:**

```
Click "Play Game" → Request permissions → Webcam Preview Screen
  ↓
User adjusts position/lighting
  ↓
Confirms positioning is good → Click "Continue"
  ↓
Start recording → Calibration begins
```

**Benefits:**

- ✅ Validates face is visible before collecting data
- ✅ Prevents wasted sessions with poor webcam quality
- ✅ Gives user control over their setup
- ✅ Reduces data collection failures
- ✅ Builds user confidence

**Files to create/modify:**

- `src/lib/camera.ts` - Camera access and management
- `src/components/webcam-preview.tsx` - Preview component with positioning guidance
- `src/lib/face-detection.ts` (optional) - Face detection using MediaPipe or face-api.js
- `src/routes/index.tsx` or new route - Integrate preview before calibration

---

### 4. Gaze Calibration (Optional but Recommended) ✅

**Priority:** Medium
**Complexity:** Medium
**Status:** COMPLETED (Overlay Component)

- [x] Create 3x3 grid of calibration points
- [x] Show points one at a time, asking user to look at each
- [x] Interactive point clicking with visual feedback
- [x] Pulse animation on click (1 second duration)
- [x] Store calibration data with timestamp and point position
- [x] Intro dialog explaining calibration process
- [x] Restart calibration option (only shown on completion screen)
- [x] Clean, distraction-free UI with only the calibration point visible
- [x] Properly centered calibration points with aligned glow effects
- [ ] Integrate calibration into game flow (before gameplay starts)
- [ ] Implement webcam preview screen before calibration
- [ ] Show live webcam feed with positioning guidance ("Center your face", "Move closer", etc.)
- [ ] Optional: Add face detection overlay to confirm face is visible
- [ ] Enable "Continue" button when user is ready
- [ ] Implement continuous recording flow: preview → calibration → game → end
- [ ] Start recording when user confirms preview is good
- [ ] Show calibration overlay (9 points) while recording
- [ ] Transition seamlessly to game after calibration (recording continues)
- [ ] Implement explicit click system during gameplay (evaluation ground truth)
- [ ] **Gamify explicit checks as "Dungeon Spirit" challenge**
- [ ] Add countdown timer in navbar: "Next Spirit: 12s" (thematic wording)
- [ ] Trigger calibration overlay at T = 15 second intervals with spirit theme
- [ ] Visual: Spirit appearance effect (fade-in, slight screen shake, audio cue optional)
- [ ] Message: "The Dungeon Spirit appears! Click to banish it!"
- [ ] Fully randomize explicit click positions (stratified random for good coverage)
- [ ] Make interruption feel like game mechanic, not technical requirement
- [ ] Implement global document.click listener to capture all click coordinates
- [ ] Label explicit vs implicit clicks in data export
- [ ] Store screen coordinates (x, y pixels) for all clicks
- [ ] Store cardId for implicit clicks (enables offline analysis: click position vs card center)
- [ ] Record webcam frames continuously from calibration through game end
- [ ] Track mapper training schedule (which clicks used for retraining)
- [ ] Stop recording when game ends
- [ ] Export data format suitable for offline Python processing

**Files created/modified:**

- `src/components/calibration-overlay.tsx` - Calibration overlay component with 3x3 grid
- `src/routes/index.tsx` - Added test button to spawn calibration overlay

**Files to create/modify for recording integration:**

- `src/components/webcam-preview.tsx` - Webcam preview component with positioning guidance
- `src/routes/game.tsx` or new calibration route - Integrate preview → calibration → game flow
- `src/lib/recording/` - Recording management (webcam + screen)
- `src/lib/face-detection.ts` (optional) - Face detection for preview validation
- Game flow: Main menu → Webcam Preview → Calibration (recording starts) → Game (recording continues) → End (recording stops)

**Implementation details:**

**Webcam Preview Component:**

- Shows live webcam feed in a bordered preview box
- Positioning guidance text:
  - "Center your face in the frame"
  - "Make sure your eyes are clearly visible"
  - "Ensure good lighting"
  - "Sit at a comfortable distance (~50-70cm from screen)"
- Optional: Face detection overlay with bounding box (confirms face is detected)
- Visual indicators:
  - ✅ Green border: Face detected and well-positioned
  - ⚠️ Yellow border: Face detected but not centered
  - ❌ Red border: No face detected
- "Continue" button (enabled after face is detected for 2+ seconds)
- "Need Help?" link with troubleshooting tips

**Calibration Overlay Component:**

- **Intro dialog** explaining the calibration process with clear instructions
- 9 calibration points in a 3x3 grid (5%, 50%, 95% positions)
- Points shown one at a time in a clean, distraction-free interface
- Interactive clicking with 1-second pulse animation on click
- Automatic progression to next point after pulse completes
- **Restart calibration** option (only on completion screen, not during calibration)
- Completion screen with success message and option to restart or continue
- Properly centered points where the coordinate represents the center (not top-left)
- Returns calibration results with point ID, position (%), timestamp, and screen coordinates

**Calibration data format:**

```typescript
interface CalibrationResult {
  pointId: string; // e.g., "top-left", "center-center"
  x: number; // percentage (10, 50, 90)
  y: number; // percentage (10, 50, 90)
  timestamp: number; // Date.now()
  screenX: number; // click position in pixels
  screenY: number; // click position in pixels
}
```

**Explicit Click System - "Dungeon Spirit" Challenge (To Be Implemented):**

The calibration overlay will be reused during gameplay, gamified as a "Dungeon Spirit" that tests the player:

- **Trigger frequency:** Every T = 15 seconds (~60 checks in 15-minute game)
- **Countdown timer:** Displayed in navbar ("Next Spirit: 12s") - builds anticipation
- **Thematic presentation:**
  - Message: "The Dungeon Spirit appears!" or "A spirit tests your focus!"
  - Visual effect: Fade-in animation, optional screen dimming
  - Audio cue (optional): Spirit sound effect
  - Point styled as glowing spirit orb (same calibration point, different context)
- **Point selection:** Fully randomized positions (stratified random within 3×3 regions)
  - Not limited to initial 9-point grid
  - `x = region_col * 33.33 + 5 + random() * 23.33` (covers 10-90% range)
  - Ensures good spatial coverage while being unpredictable
- **User flow:** Timer counts down → "Spirit appears!" → User clicks to "banish" → Continue gameplay
- **UX benefit:** Interruption feels like game mechanic rather than technical requirement
- **Data capture:**
  - Global `document.click` listener captures accurate screen coordinates
  - Store: `screenX`, `screenY` (where user clicked), `targetX`, `targetY` (ground truth)
- **Data use:** Ground truth for model accuracy evaluation (NOT used for training)
- **Data format:** Click object with `type: "explicit"` and both click + target coordinates

**Implicit Click Recording:**

- **Method:** Global `document.click` listener on all gameplay interactions
- **Stored data:** Screen coordinates (x, y pixels) + timestamp + cardId (if clicking on card)
- **Why include card ID:** Enables offline analysis to compare:
  - **Approach A:** Use click position `(screenX, screenY)` as training target
  - **Approach B:** Use card center `(cardCenterX, cardCenterY)` as training target
  - Allows testing which assumption works better: "user looks where they click" vs "user looks at card center"
- **Analysis potential:**
  - Filter implicit clicks by click-to-center distance (quality scoring)
  - Study click patterns (do users click centers vs edges?)
  - Compare mapper accuracy with different training target definitions

**Recording Integration:**

- User clicks "Play Game" button → Request webcam permission
- Show webcam preview screen (user adjusts positioning)
- User confirms positioning is good → Recording starts
- Calibration overlay appears (9 points, ~30-45 seconds, recording ongoing)
- After calibration completes, seamlessly transition to game (recording continues)
- Recording stops when game ends (all matches found)
- **Critical rationale:** Continuous recording ensures calibration data and gameplay data are temporally consistent, preventing calibration drift from context switching

**Webcam Preview Benefits:**

- Ensures data quality by validating face visibility before recording
- Gives user opportunity to adjust lighting, position, distance
- Prevents wasted recording sessions with poor webcam data
- Builds user confidence that setup is correct
- Can use simple face detection (MediaPipe, face-api.js) or manual confirmation

---

### 5. Video Recording (Screen + Webcam)

**Priority:** High
**Complexity:** Medium

**Recording Strategy: IndexedDB Streaming (CHOSEN)**

Instead of keeping video in memory, stream chunks to IndexedDB during recording to prevent memory issues and enable crash recovery.

#### Implementation Approach

- [ ] Use `MediaRecorder` API for both webcam and screen recording
- [ ] Stream chunks to IndexedDB every 5 seconds (`timeslice: 5000`)
- [ ] Record webcam (640x480, 15fps, ~600kbps) and screen (1280x720, 15fps, ~1.5Mbps) simultaneously
- [ ] Store chunks with session ID: `${sessionId}-webcam-${chunkIndex}` and `${sessionId}-screen-${chunkIndex}`
- [ ] Track recording state in IndexedDB: `recording`, `completed`, `uploaded`
- [ ] On game end: retrieve all chunks from IndexedDB → create blobs → create ZIP
- [ ] Offer local download (always) + optional upload to Cloudflare R2
- [ ] Clear IndexedDB after successful upload/download

**Benefits:**

- ✅ **Low memory usage** - Only current chunk in memory (~5-10 MB), rest in IndexedDB
- ✅ **Crash recovery** - Data persists across page refresh, tab close, browser crash
- ✅ **Large storage limit** - IndexedDB can use ~50% of available disk space (much larger than RAM)
- ✅ **Session resumption** - Can recover incomplete recordings and prompt user to upload

**Estimated file sizes (16-minute recording):**

- Webcam (640x480, 15fps, 600kbps): ~70 MB
- Screen (1280x720, 15fps, 1.5Mbps): ~180 MB
- JSON metadata: <1 MB
- **Total ZIP: ~250 MB**

#### Crash Recovery & Session Resumption

**Problem:** User accidentally refreshes page, closes tab, or browser crashes during recording/before upload.

**Solution:** IndexedDB persists across page loads. On app startup, check for orphaned sessions and offer recovery.

**Recovery Flow:**

```
App loads (main menu)
  ↓
Check IndexedDB for sessions
  ↓
Found incomplete session? (state = 'recording' or 'completed')
  ↓
Show recovery dialog:

  ┌─────────────────────────────────────────────┐
  │  Incomplete Session Found                   │
  │                                             │
  │  Session: abc-123                           │
  │  Status: Recording interrupted              │
  │  Duration: 12m 48s (partial)                │
  │  Size: ~190 MB                              │
  │                                             │
  │  You have an incomplete recording session.  │
  │  Would you like to recover and upload it?   │
  │                                             │
  │  [📥 Download Data]  [☁️ Upload]  [🗑️ Delete] │
  └─────────────────────────────────────────────┘
```

**Session States:**

- `recording` - Currently recording (interrupted by crash/refresh)
- `completed` - Recording finished but not uploaded
- `uploaded` - Successfully uploaded (can be deleted)

**Implementation Details:**

```typescript
interface RecordingSession {
  sessionId: string;
  state: "recording" | "completed" | "uploaded";
  startTime: number;
  endTime?: number;
  webcamChunkCount: number;
  screenChunkCount: number;
  metadata: SessionMetadata;
}

// On app load
async function checkForOrphanedSessions() {
  const sessions = await getSessionsFromIndexedDB();
  const incomplete = sessions.filter((s) => s.state === "recording" || s.state === "completed");

  if (incomplete.length > 0) {
    showRecoveryDialog(incomplete);
  }
}

// Recovery options
async function recoverSession(sessionId: string, action: "download" | "upload" | "delete") {
  const chunks = await getAllChunksForSession(sessionId);

  if (action === "download") {
    const zip = await createZipFromChunks(chunks);
    downloadZip(zip);
    await markSessionAsUploaded(sessionId);
  } else if (action === "upload") {
    await uploadToCloudflareR2(chunks);
    await markSessionAsUploaded(sessionId);
  } else {
    await deleteSession(sessionId);
  }
}
```

**Data Safety Features:**

- ✅ Automatic recovery on app restart
- ✅ Multiple recovery options (download/upload/delete)
- ✅ Partial recordings are not lost
- ✅ User can resume upload if network failed
- ✅ Sessions persist until explicitly deleted or uploaded

#### Recording Quality Settings

**Webcam (face/eyes for gaze estimation):**

```typescript
{
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 }  // Gaze estimation doesn't need 30fps
  }
}
// Bitrate: 600 kbps
```

**Screen (game display):**

```typescript
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 15 }  // Cards aren't moving, 15fps is sufficient
  }
}
// Bitrate: 1.5 Mbps
```

#### Export Options

**On game completion, show dialog:**

```
┌─────────────────────────────────────┐
│  Recording Complete!                 │
│                                      │
│  Session: abc-123                    │
│  Duration: 16m 32s                   │
│  Size: 247 MB                        │
│                                      │
│  [📥 Download Data Package]          │
│  (Downloads ZIP with videos + JSON)  │
│                                      │
│  [☁️ Upload to Server]               │
│  (Optional - Cloudflare R2 upload)   │
│                                      │
│  [🏠 Return to Menu]                 │
└─────────────────────────────────────┘
```

**Download creates ZIP containing:**

- `session-abc-123-webcam.webm`
- `session-abc-123-screen.webm`
- `session-abc-123-data.json`

**Upload to Cloudflare R2:**

- Uses presigned URL from backend API
- Shows progress bar
- Allows user to leave after starting (background upload with Service Worker)
- On success: marks session as uploaded in IndexedDB

**Files to create/modify:**

- `src/lib/recording/indexeddb.ts` - IndexedDB schema and operations
- `src/lib/recording/video-recorder.ts` - MediaRecorder wrapper with IndexedDB streaming
- `src/lib/recording/session-recovery.ts` - Session detection and recovery logic
- `src/lib/recording/export.ts` - ZIP creation and download/upload
- `src/components/session-recovery-dialog.tsx` - Recovery UI
- `src/components/export-dialog.tsx` - Download/upload options
- `src/routes/__root.tsx` or `src/routes/index.tsx` - Check for orphaned sessions on load

**Key considerations:**

- Synchronization is critical - both recordings must start at same time
- Store absolute start time for both recordings as reference point
- Handle browser compatibility (different browsers support different codecs)
- Screen recording uses `getDisplayMedia()` which shows browser picker (or use canvas capture)
- IndexedDB quota management - clean up old sessions periodically
- Service Worker for background upload (optional but recommended)
- Error handling for recording failures during gameplay

---

### 7. Click Event Tracking

**Priority:** High
**Complexity:** Low

- [ ] Track every click/card flip during the game
- [ ] Record click position (x, y coordinates)
- [ ] Record timestamp relative to recording start time
- [ ] Record what was clicked (card ID, position on grid)
- [ ] Store as JSON array of events

**Files to create/modify:**

- `src/lib/recording/click-tracker.ts` - Click tracking logic
- `src/routes/game.tsx` - Add click tracking to card interactions

**Data format example:**

```json
[
  {
    "timestamp": 1523,
    "x": 450,
    "y": 320,
    "cardId": "fruits-12-1",
    "gridPosition": { "row": 2, "col": 3 }
  }
]
```

---

### 8. Data Export & Upload (Integrated with Recording)

**Priority:** High
**Complexity:** Medium
**Status:** Integrated with Section 5 (Video Recording)

See **Section 5: Video Recording** for complete implementation details.

**Summary:**

- Recording chunks are stored in IndexedDB during gameplay
- On game end: retrieve chunks → create ZIP → offer download/upload
- IndexedDB provides crash recovery and session resumption
- Download is always available (primary method)
- Upload to Cloudflare R2 is optional (requires backend API)

---

### 9. Recording State Management

**Priority:** High
**Complexity:** Medium

- [ ] Create centralized store for recording state
- [ ] Track: isRecording, startTime, errors, recordedData
- [ ] Handle recording lifecycle: start → recording → stop → export
- [ ] Error handling for recording failures
- [ ] UI indicators showing recording status

**Files to create/modify:**

- `src/lib/recording/store.ts` - Zustand store for recording state
- `src/components/recording-indicator.tsx` - Visual feedback for user

---

### 10. Instructions & Tutorial

**Priority:** Medium
**Complexity:** Low

- [ ] Create instruction screens explaining the process
- [ ] Show before game starts:
  - How the game works
  - What will be recorded
  - How to position face for webcam
  - Importance of looking at cards when clicking
- [ ] Use dialog system or dedicated route

**Files to create/modify:**

- `src/components/instructions-dialog.tsx` or new route
- `src/routes/index.tsx` - Add instructions flow

---

### 11. Error Handling & Recovery

**Priority:** Medium
**Complexity:** Medium

- [ ] Handle webcam permission denied
- [ ] Handle screen recording permission denied
- [ ] Handle recording failures mid-game
- [ ] Show user-friendly error messages
- [ ] Allow retry or alternative data collection methods
- [ ] Save partial data if recording fails partway through

**Files to create/modify:**

- `src/lib/recording/error-handler.ts`
- Add error boundaries and fallbacks throughout app

---

### 12. Privacy & Security

**Priority:** High
**Complexity:** Low to Medium

- [ ] Ensure all recordings stay client-side unless explicitly uploaded
- [ ] Add clear privacy notice
- [ ] Implement data deletion after export
- [ ] Don't store sensitive data in localStorage
- [ ] Consider data anonymization options
- [ ] Add ability to review recordings before export

**Files to create/modify:**

- Update consent flow with privacy details
- Add data cleanup utilities

---

### 13. Testing & Validation

**Priority:** Medium
**Complexity:** Medium

- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different devices (desktop, laptop, tablet)
- [ ] Verify video/click timestamp synchronization
- [ ] Test with different webcam qualities
- [ ] Validate data export format
- [ ] Test recording file sizes and performance

---

### 14. Optional Enhancements

**Priority:** Low
**Complexity:** Varies

- [ ] Add progress bar showing recording status
- [ ] Allow participants to do multiple sessions
- [ ] Add data validation checks before export
- [ ] Implement server upload endpoint for data submission
- [ ] Add analytics for tracking collection success rate
- [ ] Create admin dashboard for managing collected data
- [ ] Add multiple difficulty levels back for variety
- [ ] Implement practice round without recording

---

## Development Workflow

### Recommended Implementation Order

1. **Consent & Participant Info** - Foundation for data collection
2. **Webcam Access & Preview** - Critical hardware requirement
3. **Click Event Tracking** - Simplest recording feature to implement
4. **Webcam Recording** - Core data collection
5. **Screen Recording** - Core data collection
6. **Recording State Management** - Tie everything together
7. **Data Export** - Allow users to retrieve collected data
8. **Error Handling** - Production readiness
9. **Instructions & Tutorial** - User experience
10. **Calibration** - Enhanced data quality
11. **Testing** - Validation across platforms

---

## Technical Stack

- **Frontend:** React + TanStack Router + TanStack Start
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand (for dialogs and recording state)
- **Recording APIs:** MediaRecorder, getUserMedia, getDisplayMedia
- **Build:** Vite
- **Deployment:** Cloudflare (Pages or Workers)

---

## Key Technical Challenges

1. **Synchronization** - Ensuring webcam video, screen video, and clicks all use same time reference
2. **Browser Compatibility** - MediaRecorder support varies across browsers
3. **File Size** - Video recordings can be very large
4. **Performance** - Recording + game rendering simultaneously
5. **Privacy** - Handling sensitive webcam data appropriately

---

## Success Criteria

- [ ] User can complete full data collection session without errors
- [ ] All three data types (webcam, screen, clicks) are synchronized
- [ ] Data exports in usable format for ML training
- [ ] Works in at least Chrome and Firefox
- [ ] User experience is smooth and professional
- [ ] Privacy and consent are properly handled

---

## Notes

- Consider starting with local file downloads before implementing server upload
- Test early and often with real webcam hardware
- Keep file sizes manageable - consider compression settings
- Document data format thoroughly for ML engineers who will use the data
- Consider adding data validation to ensure quality recordings
