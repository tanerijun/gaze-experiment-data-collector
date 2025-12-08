# Gaze Estimation Data Collection Platform - Implementation Prompt

## Project Overview

You are implementing a web-based gaze estimation data collection platform. The system uses a memory card matching game as a visual stimulus while collecting:

1. **Webcam video** - User's face/eyes for gaze vector extraction (offline in Python)
2. **Screen recording** - Game display showing what user is looking at
3. **Click events** - User interactions with precise timestamps and coordinates

**Core Research Goal:** Collect training data for a two-model gaze estimation system:

- **3D Gaze Model** (pre-trained): Extracts gaze vectors from webcam frames
- **Mapper Model** (personalized): Maps gaze vectors to screen coordinates using linear regression

## System Architecture

### Two Types of Calibration

1. **Initial Calibration (9-point grid)**
   - User clicks 9 points at start (5%, 50%, 95% positions in 3×3 grid)
   - Provides anchor points for initial mapper training
   - Recorded with webcam for gaze vector extraction

2. **Dynamic Calibration (Continuous)**
   - Mapper retrains using: 9 anchors + recent N implicit clicks
   - Compensates for head pose drift during use

### Two Types of Clicks

1. **Explicit Clicks (Evaluation Ground Truth)**
   - Random calibration points shown every 15 seconds during gameplay
   - **Gamified as "Dungeon Spirit" challenge** - makes interruption feel like game mechanic
   - User clicks point to "banish spirit"
   - NOT used for training (prevents bias)
   - Provides unbiased accuracy evaluation data

2. **Implicit Clicks (Training Data)**
   - All gameplay clicks (card flips, UI interactions)
   - Assumption: user is looking at what they click
   - Used for dynamic calibration (continuous mapper retraining)

### Recording Strategy: IndexedDB Streaming

**Critical:** Videos are streamed to IndexedDB during recording (NOT kept in memory) to:

- Prevent memory overflow (16-minute recording = ~250 MB)
- Enable crash recovery (IndexedDB persists across page refreshes)
- Allow session resumption (can recover and upload incomplete recordings)

**Process Flow:**

```
User consent dialog, participant info dialog (demographics) (persisted to local storage)
  ↓
Full screen prompt
  ↓
User clicks "Play Game"
  ↓
Webcam Preview (positioning check)
  ↓
START RECORDING (both webcam + screen to IndexedDB)
  ↓
Calibration (9 points, ~30-45 seconds)
  ↓
Game starts (recording continues)
  ↓
Every 15s: "Dungeon Spirit" appears (explicit check)
  ↓
All clicks tracked (implicit data)
  ↓
Game ends
  ↓
STOP RECORDING
  ↓
Export Dialog (Download ZIP + Optional Upload to R2)
```

**Why continuous recording from calibration through game:**

- Temporal consistency - calibration and game data from same session
- Prevents calibration drift - if user calibrates, leaves, returns later, head pose may have changed
- Essential - webcam frames during calibration are needed to extract gaze vectors for anchor points

## Tech Stack

- **Frontend:** React + TanStack Router + TanStack Start
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (dialogs, consent, participant data, recording state)
- **Recording:** MediaRecorder API → IndexedDB (streaming chunks)
- **Build:** Vite
- **Deployment Target:** Cloudflare Pages/Workers

## Current Status

### ✅ Completed Components

1. **Consent Flow**
   - Dialog explaining data collection
   - localStorage persistence
   - Gates "Play Game" button until consent given

2. **Fullscreen Requirement**
   - Required for accurate click coordinate tracking
   - Prompts after consent
   - Monitors during gameplay (pauses if user exits fullscreen)

3. **Calibration Overlay Component** (`src/components/calibration-overlay.tsx`)
   - 9-point grid (5%, 50%, 95% positions)
   - Shows one point at a time
   - 1-second pulse animation on click
   - Intro dialog explaining process
   - Restart option
   - Returns: `CalibrationResult[]` with coordinates + timestamps

4. **Base Game** (`src/routes/game.tsx`)
   - Memory card matching (16 pairs)
   - Game mechanics working
   - Statistics tracking

5. **Dialog System** (`src/lib/dialog/`)
   - Custom dialogs with hooks
   - Used throughout app

### 🚧 What Needs to Be Implemented

See detailed TODO list below.

## Data Format (Browser Export)

**Important:** Browser only collects raw data. Gaze vector extraction and mapper inference happen offline in Python.

```json
{
  "sessionId": "uuid-v4",
  "participant": {
    "name": "Optional",
    "ageRange": "26-35",
    "gender": "Female",
    "wearingGlasses": true,
    "wearingContacts": false
  },
  "webcamVideo": "session-abc-webcam.webm",
  "screenVideo": "session-abc-screen.webm",
  "recordingStartTime": 1234567890,
  "recordingDuration": 945000,
  "screenResolution": { "width": 1920, "height": 1080 },
  "webcamResolution": { "width": 1280, "height": 720 },
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
        "timestamp": 5000,
        "videoTimestamp": 5000
      }
      // ... 8 more points
    ]
  },
  "cardPositions": [
    {
      "cardId": "card-1-1",
      "x": 120,
      "y": 200,
      "width": 80,
      "height": 100,
      "centerX": 160,
      "centerY": 250
    }
    // ... all cards (recorded at game start, for offline analysis)
  ],
  "gameStartTimestamp": 50000,
  "clicks": [
    {
      "id": "click-00001",
      "timestamp": 1523,
      "videoTimestamp": 1523,
      "type": "explicit",
      "screenX": 450,
      "screenY": 320,
      "targetX": 448,
      "targetY": 318,
      "cardId": null
    },
    {
      "id": "click-00002",
      "timestamp": 2841,
      "videoTimestamp": 2841,
      "type": "implicit",
      "screenX": 325,
      "screenY": 450,
      "targetX": null,
      "targetY": null,
      "cardId": "card-5-1"
    }
  ],
  "gameEndTimestamp": 945000,
  "gameMetadata": {
    "duration": 847,
    "totalMoves": 64,
    "totalMatches": 16,
    "totalExplicitClicks": 70,
    "totalImplicitClicks": 400
  }
}
```

## Recording Quality Settings

**Webcam (face/eyes for gaze estimation):**

- Resolution: 720p if possible, else 640×480
- Frame rate: highest possible

**Screen (game display):**

- Resolution: match user screen
- Frame rate: highest possible

## Implementation TODOs

### Priority 1: Flow Integration (Start Here)

#### 1. Participant Information Dialog

**File:** `src/components/participant-info-dialog.tsx`

Create dialog to collect demographics (shown after consent, before full screen prompt):

- Name (optional)
- Age range (required): 5-17, 18-25, 26-35, 36-45, 46-55, 56-65, 65+
- Gender (required): Male, Female
- Wearing glasses? (required): Yes/No
- Wearing contact lenses? (required): Yes/No

**File:** `src/lib/participant.ts`

- Zustand store (persisted) for participant data
- Type definitions
- Validation logic

**Integration:** Show dialog in `src/routes/index.tsx` after consent

---

#### 2. Webcam Preview Component

**File:** `src/components/webcam-preview.tsx`

Before calibration, show live webcam feed so user can:

- Check face is centered
- Verify good lighting
- Adjust position (~50-70cm from screen)

**Features:**

- Live video preview
- Positioning guidance text:
  - "Center your face in the frame"
  - "Make sure your eyes are clearly visible"
  - "Ensure good lighting"
  - "Sit at a comfortable distance"
- Optional: Face detection with visual feedback (green/yellow/red border)
- Camera selection dropdown (if multiple cameras)
- "Continue" button (enabled when ready, or after 2s if using face detection)

**File:** `src/lib/camera.ts`

- Request webcam permission
- Get available cameras
- Stream management
- Error handling

**Optional:** `src/lib/face-detection.ts`

- Use MediaPipe Face Detection (BlazeFace) or face-api.js
- Detect face in preview
- Check if centered
- Visual feedback

---

#### 3. Integrate Calibration into Game Flow

**Current:** Calibration is standalone test component
**Needed:** Integrate into actual flow

**Option A:** Create new route `/setup` that shows:

1. Participant info dialog
2. Webcam preview
3. Calibration overlay
4. Navigate to `/game` after completion

**Option B:** Modify `/game` route to check if calibration is done:

- If not done: show setup flow first
- If done: start game directly

**Store calibration state** so user doesn't repeat if they return to menu

---

### Priority 2: Recording System

#### 4. IndexedDB Infrastructure

**File:** `src/lib/recording/indexeddb.ts`

Set up IndexedDB with schema:

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

// Stores:
// - sessions: RecordingSession[]
// - chunks: { key: `${sessionId}-webcam-${index}`, value: Blob }
// - chunks: { key: `${sessionId}-screen-${index}`, value: Blob }
```

Functions needed:

- `initDB()` - Open/create database
- `createSession(metadata)` - Create new session
- `saveChunk(sessionId, type, index, blob)` - Save video chunk
- `getSession(sessionId)` - Get session info
- `getAllSessions()` - List all sessions
- `updateSessionState(sessionId, state)` - Update state
- `getChunksForSession(sessionId, type)` - Retrieve all chunks
- `deleteSession(sessionId)` - Clean up

---

#### 5. Video Recorder (Webcam + Screen)

**File:** `src/lib/recording/video-recorder.ts`

Wrapper around MediaRecorder that streams to IndexedDB:

```typescript
class VideoRecorder {
  constructor(stream: MediaStream, sessionId: string, type: "webcam" | "screen");

  start(): void; // Start recording with 5s timeslice
  stop(): Promise<void>; // Stop and finalize

  // Private: handle ondataavailable
  private async handleChunk(blob: Blob) {
    await saveChunk(this.sessionId, this.type, this.chunkIndex++, blob);
  }
}
```

**Usage:**

```typescript
const webcamRecorder = new VideoRecorder(webcamStream, sessionId, "webcam");
const screenRecorder = new VideoRecorder(screenStream, sessionId, "screen");

webcamRecorder.start();
screenRecorder.start();

// Later...
await Promise.all([webcamRecorder.stop(), screenRecorder.stop()]);
```

---

#### 6. Recording Lifecycle Management

**File:** `src/lib/recording/recording-manager.ts`

Orchestrates entire recording flow:

```typescript
class RecordingManager {
  async startRecording(participantInfo: ParticipantInfo): Promise<string> {
    // 1. Get webcam stream (already obtained in preview)
    // 2. Get screen stream (getDisplayMedia or canvas capture)
    // 3. Create session in IndexedDB
    // 4. Start both video recorders
    // 5. Return sessionId
  }

  async stopRecording(sessionId: string): Promise<void> {
    // 1. Stop both recorders
    // 2. Update session state to 'completed'
  }

  getRecordingState(): RecordingState; // For UI indicators
}
```

**Integration points:**

- Start recording when user clicks "Continue" on webcam preview (before calibration)
- Keep recording through calibration and game
- Stop when game ends

---

### Priority 3: Click Tracking

#### 7. Global Click Listener

**File:** `src/lib/recording/click-tracker.ts`

Track ALL clicks during gameplay:

```typescript
class ClickTracker {
  constructor(sessionId: string, recordingStartTime: number);

  start(): void {
    document.addEventListener("click", this.handleClick);
  }

  stop(): void {
    document.removeEventListener("click", this.handleClick);
  }

  private handleClick(event: MouseEvent): void {
    const click: ClickData = {
      id: `click-${this.clickIndex++}`,
      timestamp: Date.now() - this.gameStartTime,
      videoTimestamp: Date.now() - this.recordingStartTime,
      type: this.currentClickType, // 'explicit' or 'implicit'
      screenX: event.clientX,
      screenY: event.clientY,
      targetX: this.explicitTarget?.x ?? null,
      targetY: this.explicitTarget?.y ?? null,
      cardId: this.getCardIdAtPosition(event.clientX, event.clientY),
    };

    this.clicks.push(click);
  }

  setExplicitMode(targetX: number, targetY: number): void;
  setImplicitMode(): void;
  getClickData(): ClickData[];
}
```

**Card ID detection:**

- Store card positions when game starts
- Check if click coordinates are within any card bounds
- Return cardId if clicking on card, null otherwise

---

#### 8. Explicit Click System (Dungeon Spirit)

**File:** `src/components/dungeon-spirit-overlay.tsx`

Reuse calibration overlay component but with "Dungeon Spirit" theme:

- Random position (stratified: divide screen into 4×4 regions, random within each, keep distribution balanced)
- Message: "The Dungeon Spirit appears!"
- Same visual as calibration point (or themed as spirit orb)
- On click: "Spirit banished!"

**File:** `src/hooks/use-spirit-timer.ts`

Hook for managing 15-second timer:

```typescript
function useSpiritTimer() {
  const [secondsUntilSpirit, setSecondsUntilSpirit] = useState(15);
  const [showSpirit, setShowSpirit] = useState(false);
  const [spiritPosition, setSpiritPosition] = useState<{ x: number; y: number }>();

  // Countdown logic
  // On 0: generate random position, show spirit
  // After click: reset timer

  return { secondsUntilSpirit, showSpirit, spiritPosition, onSpiritClick };
}
```

**Integration in game:**

- Add timer to `GameNavbar`: "Next Spirit: 12s" with spirit emoji
- When timer hits 0: show overlay
- Set click tracker to explicit mode
- On click: record explicit click, hide overlay, reset timer
- Important: Pause timer if game is paused (fullscreen exit)

---

### Priority 4: Data Export

#### 9. Session Recovery Dialog

**File:** `src/components/session-recovery-dialog.tsx`

On app load, check IndexedDB for orphaned sessions:

```typescript
// In src/routes/index.tsx or __root.tsx
useEffect(() => {
  checkForOrphanedSessions().then((incomplete) => {
    if (incomplete.length > 0) {
      showRecoveryDialog(incomplete);
    }
  });
}, []);
```

**Dialog shows:**

- List of incomplete sessions
- Session ID, status, duration, estimated size
- Options: Download / Upload / Delete

**File:** `src/lib/recording/session-recovery.ts`

- Check for sessions with state = "recording" or "completed"
- Recover partial recordings
- Allow user to download/upload

---

#### 11. Export Dialog & ZIP Creation

**File:** `src/components/export-dialog.tsx`

Shown when game ends:

```
┌─────────────────────────────────────┐
│  Recording Complete!                 │
│  Session: abc-123                    │
│  Duration: 16m 32s                   │
│  Size: 247 MB                        │
│                                      │
│  [📥 Download Data Package]          │
│  [☁️ Upload to Server]               │
│  [🏠 Return to Menu]                 │
└─────────────────────────────────────┘
```

**File:** `src/lib/recording/export.ts`

```typescript
async function createDataPackage(sessionId: string): Promise<Blob> {
  // 1. Retrieve all chunks from IndexedDB
  const webcamChunks = await getChunksForSession(sessionId, "webcam");
  const screenChunks = await getChunksForSession(sessionId, "screen");

  // 2. Combine chunks into blobs
  const webcamBlob = new Blob(webcamChunks, { type: "video/webm" });
  const screenBlob = new Blob(screenChunks, { type: "video/webm" });

  // 3. Create JSON metadata
  const metadata = {
    sessionId,
    participant: getParticipantInfo(),
    initialCalibration: getCalibrationResults(),
    clicks: getClickData(),
    cardPositions: getCardPositions(),
    // ... all other metadata
  };
  const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });

  // 4. Create ZIP
  const zip = new JSZip();
  zip.file(`session-${sessionId}-webcam.webm`, webcamBlob);
  zip.file(`session-${sessionId}-screen.webm`, screenBlob);
  zip.file(`session-${sessionId}-data.json`, jsonBlob);

  return await zip.generateAsync({ type: "blob" });
}

function downloadZip(zipBlob: Blob, sessionId: string): void {
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gaze-session-${sessionId}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Dependencies:** You'll need to add `jszip` package for ZIP creation

---

#### 12. Upload to Cloudflare R2 (Optional)

**File:** `src/lib/recording/upload.ts`

```typescript
async function uploadToR2(
  zipBlob: Blob,
  sessionId: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  // 1. Get presigned URL from backend API
  const { uploadUrl } = await fetch("/api/get-upload-url", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  }).then((r) => r.json());

  // 2. Upload with progress tracking
  // Use XMLHttpRequest for progress events
  // Or use fetch with ReadableStream if supported

  // 3. On success: mark session as uploaded in IndexedDB
  await updateSessionState(sessionId, "uploaded");
}
```

**Note:** This requires backend API endpoint. Can be implemented later.

---

### Priority 5: UI Polish

#### 13. Recording State Indicators

- Show recording indicator during gameplay (red dot, "Recording...")
- Display recording time
- Optional: Estimated file size

#### 14. Error Handling

- Webcam permission denied → Show helpful message
- Screen recording permission denied → Fallback or error
- Recording fails mid-game → Save what we have, notify user
- IndexedDB quota exceeded → Warning, reduce quality
- Upload fails → Allow retry

#### 15. Game Integration

- Ensure game doesn't start until recording is ready
- Pause game if recording fails
- Smooth transitions between phases

---

## Important Constraints

### DO NOT:

- ❌ Write documentation files unless explicitly asked
- ❌ Write barrel files (index.ts exports) unless explicitly asked
- ❌ Create unnecessary abstractions - keep it simple
- ❌ Add features not specified in this prompt

### DO:

- ✅ Use existing components/hooks where possible
- ✅ Follow the established code style (check existing files)
- ✅ Add TypeScript types for all data structures
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Test in browser during development
- ✅ Ask for clarification if requirements are unclear

### Code Style:

- Use functional components with hooks (no class components)
- Use Tailwind for styling (existing theme: amber/stone colors)
- Use Zustand for state management
- Use TanStack Router for navigation
- Prefer composition over inheritance
- Keep components focused (single responsibility)

---

## Testing Checklist

After implementation, verify:

- [ ] Full flow works: Consent → Info → Preview → Calibration → Game → Export
- [ ] Webcam recording saves to IndexedDB (check DevTools)
- [ ] Screen recording saves to IndexedDB
- [ ] Both recordings start at same time (synchronized)
- [ ] Calibration points are clickable and advance
- [ ] Spirit timer counts down and shows overlay every 15s
- [ ] All clicks are tracked (check click data)
- [ ] Card positions are recorded correctly
- [ ] Explicit clicks have targetX/targetY, implicit don't
- [ ] Implicit clicks on cards have cardId
- [ ] Game ends → Export dialog appears
- [ ] Download creates valid ZIP with 3 files
- [ ] Session recovery works after page refresh
- [ ] IndexedDB doesn't fill up RAM (check memory usage)
- [ ] Videos are playable (verify codecs)
- [ ] JSON is valid and complete

---

## Example Implementation Order

1. Start with participant info dialog (simple form)
2. Implement webcam preview (get camera working first)
3. Create IndexedDB schema and basic operations
4. Implement video recorder class (test with just webcam first)
5. Add screen recording
6. Integrate recording start/stop into flow
7. Add click tracking (global listener)
8. Add spirit timer to game
9. Implement explicit click overlay trigger
10. Create export dialog and ZIP download
11. Add session recovery on app load
12. Polish UI and error handling

---

## Questions to Ask If Unclear

- Should webcam preview include face detection or just manual confirmation?
- Should screen recording use getDisplayMedia (browser picker) or canvas capture?
- Should upload to R2 be implemented now or later?
- What should happen if user has multiple incomplete sessions?
- Should we add sound effects for spirit appearance?
- How should we handle users who don't have webcam?

---

## Additional Context

See these files for reference:

- `PLAN.md` - Comprehensive project plan
- `EVALUATION_DISCUSSION.md` - Why we chose random points over cards
- `src/components/calibration-overlay.tsx` - Example of well-implemented component
- `src/lib/dialog/` - Dialog system for reference
- `src/lib/consent.ts` - Example of Zustand store with persistence

Good luck! Build something great. 🚀
