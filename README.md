# Gaze Experiment Data Collector

This is a web-based data collection platform designed to gather training data for gaze estimation machine learning models. The platform uses an engaging memory card matching game as the visual stimulus while simultaneously recording webcam video (user's face/eyes), screen recordings (what they're looking at), and precise click events with timestamps.

## How It Works (High-Level)

### User Journey

1. **Consent & Information Collection**
   - User reads and agrees to data collection consent
   - User provides demographic information (name, age, gender, vision correction)
   - Platform explains what data will be collected and how it will be used

2. **Setup & Permissions**
   - **Webcam Access**: User grants camera permission to record their face during gameplay
   - **Screen Recording**: User grants screen capture permission (must select "Entire Screen")
   - **Fullscreen Mode**: User enters fullscreen for accurate click position tracking
   - All recordings are processed locally in the browser - nothing is uploaded automatically

3. **Initial Calibration**
   - User completes a 9-point calibration sequence
   - Yellow dots appear at strategic screen positions (corners, edges, center)
   - User clicks each dot in sequence while looking directly at it
   - This establishes ground truth for gaze position mapping
   - Calibration must be completed in fullscreen mode

4. **Memory Card Game**
   - User plays a memory matching game with animated cards
   - Two types of click are recorded:
     - **Explicit clicks**: Clicks recorded when user click on ghosts that appear on each successful match
     - **Implicit clicks**: Any other clicks
   - Game continues until all pairs are matched

5. **Data Export**
   - After winning, user upload their data package to the server
   - Data is packaged as a ZIP file containing videos and metadata

### Technical Flow

```
Browser Initialization
    ↓
Consent & Demographics
    ↓
Request Webcam Stream (for preview, not yet recording)
    ↓
Request Screen Capture Stream (must be entire screen)
    ↓
Enter Fullscreen Mode
    ↓
Start Recording to IndexedDB (both streams simultaneously)
    ↓
9-Point Calibration Sequence
    ↓
Game Begins (recording continues)
    ↓
Track All Clicks (implicit on cards, explicit on spirits)
    ↓
Game Completes
    ↓
Stop Recording
    ↓
Export Options (Download ZIP or Upload to Server)
```

---

## Data Collection Details

### 1. Video Recordings

#### Webcam Video

- **Resolution**: 1280x720 at 30fps (ideal settings)
- **Content**: User's face and eyes during entire session
- **Format**: MP4 or WebM (browser-dependent)
- **Bitrate**: 3 Mbps
- **Storage**: Streamed to IndexedDB in 1-second chunks
- **Purpose**: Capture facial features and eye movements for gaze estimation

#### Screen Video

- **Resolution**: Native screen resolution
- **Content**: Full screen capture of game interface
- **Format**: MP4 or WebM (browser-dependent)
- **Bitrate**: 5 Mbps
- **Storage**: Streamed to IndexedDB in 1-second chunks
- **Purpose**: Capture what the user is viewing (ground truth visual context)

#### Video Alignment

- The system tracks the exact timestamp when each stream's first chunk arrives
- This allows for precise synchronization between webcam and screen recordings
- Alignment metadata includes offset information to trim videos perfectly in post-processing

### 2. Calibration Data

#### Initial Calibration (9-Point)

- **When**: Before gameplay begins
- **What**: User clicks 9 strategically placed dots
- **Positions**:
  - Top row: 5%, 50%, 95% from left
  - Middle row: 5%, 50%, 95% from left
  - Bottom row: 5%, 50%, 95% from left
  - Vertical positions: 5%, 50%, 95% from top

**Captured per point:**

- Point ID (e.g., "top-left", "center-center")
- Expected position (percentage coordinates)
- Actual click position (pixel coordinates)
- Timestamp (absolute and relative to recording start)

#### Explicit Calibration (Dungeon Spirits)

- **When**: Appears after matching card pairs
- **What**: Semi-transparent purple ghost overlays that require clicks to dismiss
- **Frequency**: Appears after successful card matches
- **Clicks Required**: 3 clicks to banish each spirit
- **Positions**: Based on the provided coordinates
- **Purpose**: Serve as ground truth point for model evaluation

#### Dungeon Spirits Positioning (Percentage from top-left (0, 0))

```js
const SPIRIT_POSITIONS: SpiritPosition[] = [
	{ x: 11.97, y: 16.08 },
	{ x: 62.57, y: 49.65 },
	{ x: 11.3, y: 83.22 },
	{ x: 87.63, y: 17.14 },
	{ x: 37.63, y: 17.61 },
	{ x: 62.5, y: 84.15 },
	{ x: 11.84, y: 49.65 },
	{ x: 87.77, y: 84.51 },
	{ x: 62.63, y: 16.31 },
	{ x: 37.7, y: 84.62 },
	{ x: 88.03, y: 49.41 },
	{ x: 37.63, y: 49.53 },
	{ x: 18.28, y: 23.71 },
	{ x: 69.88, y: 59.04 },
	{ x: 19.95, y: 92.25 },
	{ x: 95.21, y: 25.82 },
	{ x: 45.01, y: 26.29 },
	{ x: 69.88, y: 92.49 },
	{ x: 19.08, y: 59.04 },
	{ x: 94.88, y: 92.84 },
	{ x: 69.55, y: 25.23 },
	{ x: 45.21, y: 93.31 },
	{ x: 95.15, y: 58.92 },
	{ x: 45.21, y: 60.09 },
	{ x: 5.39, y: 7.75 },
	{ x: 54.59, y: 41.55 },
	{ x: 3.39, y: 73.71 },
	{ x: 79.39, y: 6.34 },
	{ x: 30.05, y: 6.92 },
	{ x: 54.85, y: 74.18 },
	{ x: 5.52, y: 40.61 },
	{ x: 79.99, y: 73.36 },
	{ x: 55.52, y: 6.81 },
	{ x: 30.19, y: 74.18 },
	{ x: 79.52, y: 40.02 },
	{ x: 30.45, y: 41.67 },
	{ x: 5.78, y: 25 },
	{ x: 55.98, y: 59.98 },
	{ x: 4.65, y: 91.67 },
	{ x: 80.19, y: 25.94 },
	{ x: 30.05, y: 25.94 },
	{ x: 54.72, y: 93.31 },
	{ x: 6.05, y: 58.22 },
	{ x: 93.28, y: 74.65 },
	{ x: 69.41, y: 8.33 },
	{ x: 43.68, y: 76.06 },
	{ x: 93.48, y: 41.78 },
	{ x: 44.41, y: 42.84 },
	{ x: 18.15, y: 7.86 },
	{ x: 68.95, y: 42.02 },
	{ x: 18.42, y: 75.47 },
	{ x: 93.62, y: 8.8 },
	{ x: 44.41, y: 8.33 },
	{ x: 69.48, y: 75.23 },
	{ x: 19.02, y: 41.78 },
	{ x: 80.85, y: 90.14 },
	{ x: 55.92, y: 23.36 },
	{ x: 30.45, y: 90.26 },
	{ x: 80.32, y: 56.81 },
	{ x: 30.59, y: 56.92 },
]
```

### 3. Click Data

Every single click during the session is captured with:

```json
{
  "id": "click-1234567890-abc123",
  "timestamp": 1704123456789,
  "videoTimestamp": 45230,
  "type": "explicit" | "implicit",
  "screenX": 1024,
  "screenY": 768,
  "targetX": 1050,
  "targetY": 790,
  "cardId": "card-img-15-1" | null
}
```

- **id**: Unique identifier for the click
- **timestamp**: Absolute Unix timestamp in milliseconds
- **videoTimestamp**: Milliseconds elapsed since recording started (for video alignment)
- **type**:
  - `"implicit"` = clicks on game cards
  - `"explicit"` = clicks on dungeon spirits
- **screenX, screenY**: Exact pixel coordinates where user clicked
- **targetX, targetY**: Center coordinates of the clicked element (card or spirit)
- **cardId**: Identifier of the card if click was on a card

### 4. Card Position Data

Captured at game start, records the exact position of every card:

```json
{
  "cardId": "card-img-15-1",
  "x": 450,
  "y": 300,
  "width": 120,
  "height": 160,
  "centerX": 510,
  "centerY": 380
}
```

This allows researchers to know precisely where each clickable element was located on screen.

### 5. Game Metadata

Overall session statistics:

```json
{
  "duration": 245,
  "totalMoves": 32,
  "totalMatches": 12,
  "totalExplicitClicks": 15,
  "totalImplicitClicks": 64
}
```

- **duration**: Total game time in seconds
- **totalMoves**: Number of card flip attempts (pairs flipped)
- **totalMatches**: Number of successful card matches
- **totalExplicitClicks**: Clicks on dungeon spirits
- **totalImplicitClicks**: Clicks on game cards

### 6. Participant Information

Demographic data collected before gameplay:

```json
{
  "name": "John Doe",
  "age": 25,
  "gender": "male" | "female" | "prefer-not-to-say",
  "wearingGlasses": true,
  "wearingContacts": false
}
```

### 7. Technical Metadata

System information captured automatically:

```json
{
  "sessionId": "session-1704123456789-xyz789",
  "recordingStartTime": 1704123456789,
  "recordingDuration": 245,
  "screenResolution": {
    "width": 1920,
    "height": 1080
  },
  "screenStreamResolution": {
    "width": 1920,
    "height": 1080
  },
  "webcamResolution": {
    "width": 1280,
    "height": 720
  },
  "webcamMimeType": "video/mp4;codecs=avc1,mp4a.40.2",
  "screenMimeType": "video/mp4;codecs=avc1,mp4a.40.2"
}
```

---

## Sample Data Package Structure

When exported, the data is packaged as a ZIP file:

```
participant-name-2024-01-20-session-xyz789.zip
│
├── webcam.mp4              # Face/eye recording
├── screen.mp4              # Screen capture of gameplay
└── metadata.json           # All collected data points
```

### Sample metadata.json

```json
{
  "sessionId": "session-1704123456789-xyz789",
  "participant": {
    "name": "Jane Smith",
    "age": 28,
    "gender": "female",
    "wearingGlasses": false,
    "wearingContacts": true
  },
  "recordingStartTime": 1704123456789,
  "recordingDuration": 245,
  "screenResolution": {
    "width": 1920,
    "height": 1080
  },
  "screenStreamResolution": {
    "width": 1920,
    "height": 1080
  },
  "webcamResolution": {
    "width": 1280,
    "height": 720
  },
  "webcamMimeType": "video/mp4;codecs=avc1,mp4a.40.2",
  "screenMimeType": "video/mp4;codecs=avc1,mp4a.40.2",
  "initialCalibration": {
    "startTimestamp": 1704123456900,
    "endTimestamp": 1704123467850,
    "points": [
      {
        "pointId": "top-left",
        "x": 5,
        "y": 5,
        "screenX": 96,
        "screenY": 54,
        "timestamp": 1704123457100,
        "videoTimestamp": 311
      },
      {
        "pointId": "top-center",
        "x": 50,
        "y": 5,
        "screenX": 960,
        "screenY": 54,
        "timestamp": 1704123458200,
        "videoTimestamp": 1411
      }
      // ... 7 more calibration points
    ]
  },
  "cardPositions": [
    {
      "cardId": "card-img-15-1",
      "x": 450,
      "y": 300,
      "width": 120,
      "height": 160,
      "centerX": 510,
      "centerY": 380
    }
    // ... all card positions
  ],
  "gameStartTimestamp": 1704123468000,
  "clicks": [
    {
      "id": "click-1704123470123-abc",
      "timestamp": 1704123470123,
      "videoTimestamp": 13334,
      "type": "implicit",
      "screenX": 510,
      "screenY": 380,
      "targetX": 510,
      "targetY": 380,
      "cardId": "card-img-15-1"
    },
    {
      "id": "click-1704123490500-def",
      "timestamp": 1704123490500,
      "videoTimestamp": 33711,
      "type": "explicit",
      "screenX": 800,
      "screenY": 450,
      "targetX": 805,
      "targetY": 445,
      "cardId": null
    }
    // ... all clicks during session
  ],
  "gameEndTimestamp": 1704123701789,
  "gameMetadata": {
    "duration": 245,
    "totalMoves": 32,
    "totalMatches": 12,
    "totalExplicitClicks": 15,
    "totalImplicitClicks": 64
  },
  "videoAlignment": {
    "sessionId": "session-1704123456789-xyz789",
    "recordingStartTime": 1704123456789,
    "webcam": {
      "firstChunkTime": 1704123456850,
      "offsetFromStart": 61,
      "totalChunks": 245
    },
    "screen": {
      "firstChunkTime": 1704123456920,
      "offsetFromStart": 131,
      "totalChunks": 245
    },
    "alignment": {
      "webcamLeadsBy": 70,
      "screenLeadsBy": 0,
      "trimWebcamBy": 70,
      "trimScreenBy": 0
    }
  }
}
```

## Data Collection Rationale

### Why Memory Card Game?

- **Natural Eye Movements**: Players naturally look at cards they're trying to memorize
- **Predictable Click Targets**: Cards are clear, distinct targets with known positions
- **Engaging**: Keeps participants focused and motivated

### Why Dungeon Spirits (Explicit Calibration)?

- **Ground Truth**: Provides ground truth for model evaluation
- **Forced Attention**: Players must look directly at spirit then click it
- **Natural Integration**: Fits game theme, doesn't break immersion

### Why Both Webcam and Screen?

Actually the gaze model only need webcam, but screen is useful for making demos

## Credits

- **Kenney**: Game assets ([kenney-assets.itch.io](https://kenney-assets.itch.io/))
- **CraftPix**: UI elements ([craftpix.net](https://craftpix.net/))
- **Game-icons**: Icon set ([game-icons.net](https://game-icons.net/))

## Credits

- [Kenney](https://kenney-assets.itch.io/)
- [CraftPix](https://craftpix.net/)
- [Game-icons](https://game-icons.net/)
