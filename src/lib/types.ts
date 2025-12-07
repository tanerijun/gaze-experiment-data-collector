export interface GridConfig {
	pairs: number
}

export interface CalculatedLayout {
	rows: number
	cols: number
	cardSize: number
	gap: number
}

export interface Card {
	id: string // unique identifier for this card instance
	imageId: string // identifier for matching (same imageId = pair)
	imagePath: string // path to the image file
	isFlipped: boolean // whether card is currently flipped
	isMatched: boolean // whether card has been matched
}

export type GameState = "initial" | "playing" | "won"

export interface GameStats {
	moves: number
	matches: number
	timeElapsed: number // in seconds
}

// Image metadata
export interface ImageItem {
	category: string
	id: number
	path: string
}

// Participant information
export interface ParticipantInfo {
	name: string
	age: number
	gender: string
	wearingGlasses: boolean
	wearingContacts: boolean
}

// Calibration data
export interface CalibrationPoint {
	pointId: string
	x: number // percentage
	y: number // percentage
	screenX: number // actual pixel coordinates
	screenY: number // actual pixel coordinates
	timestamp: number
	videoTimestamp?: number // timestamp relative to video start
}

export interface CalibrationData {
	startTimestamp: number
	endTimestamp: number
	points: CalibrationPoint[]
}

// Click data
export interface ClickData {
	id: string
	timestamp: number
	videoTimestamp: number // timestamp relative to video start
	type: "explicit" | "implicit"
	screenX: number
	screenY: number
	targetX?: number | null // target position if clicking on a card
	targetY?: number | null
	cardId?: string | null // which card was clicked
}

// Card position data
export interface CardPosition {
	cardId: string
	x: number
	y: number
	width: number
	height: number
	centerX: number
	centerY: number
}

// Game metadata
export interface GameMetadata {
	duration: number // in seconds
	totalMoves: number
	totalMatches: number
	totalExplicitClicks: number
	totalImplicitClicks: number
}

// Session data (what gets exported)
export interface SessionData {
	sessionId: string
	participant: ParticipantInfo
	webcamVideo: Blob
	screenVideo: Blob
	recordingStartTime: number
	recordingDuration: number // in seconds
	screenResolution: {
		width: number
		height: number
	}
	screenStreamResolution: {
		width: number
		height: number
	}
	webcamResolution: {
		width: number
		height: number
	}
	initialCalibration: CalibrationData
	cardPositions: CardPosition[]
	gameStartTimestamp: number
	clicks: ClickData[]
	gameEndTimestamp: number
	gameMetadata: GameMetadata
}

// IndexedDB storage types
export interface VideoChunk {
	sessionId: string
	type: "webcam" | "screen"
	timestamp: number
	data: Blob
}

export interface RecordingSession {
	sessionId: string
	participant: ParticipantInfo
	recordingStartTime: number
	recordingDuration?: number
	screenResolution: {
		width: number
		height: number
	}
	screenStreamResolution: {
		width: number
		height: number
	}
	webcamResolution: {
		width: number
		height: number
	}
	status: "recording" | "completed" | "uploaded" | "error"
	initialCalibration?: CalibrationData
	webcamMimeType?: string
	screenMimeType?: string
	// Game data
	clicks?: ClickData[]
	cardPositions?: CardPosition[]
	gameStartTimestamp?: number
	gameEndTimestamp?: number
	gameMetadata?: GameMetadata
}
