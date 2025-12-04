/**
 * Recording Manager - Coordinates webcam, screen recording, and session management
 */

import { getSession, storeSession } from "./indexed-db"
import type {
	CalibrationData,
	CardPosition,
	ClickData,
	GameMetadata,
	ParticipantInfo,
	RecordingSession,
} from "./types"
import { getStreamResolution, VideoRecorder } from "./video-recorder"

export class RecordingManager {
	private sessionId: string
	private participant: ParticipantInfo
	private initialCalibration: CalibrationData | null = null
	private webcamRecorder: VideoRecorder
	private screenRecorder: VideoRecorder
	private recordingStartTime: number = 0
	private isRecording = false
	private clicks: ClickData[] = []
	private cardPositions: CardPosition[] = []
	private gameStartTimestamp: number = 0
	private gameEndTimestamp: number = 0
	private gameMetadata: GameMetadata = {
		duration: 0,
		totalMoves: 0,
		totalMatches: 0,
		totalExplicitClicks: 0,
		totalImplicitClicks: 0,
	}

	constructor(options: {
		sessionId: string
		participant: ParticipantInfo
	}) {
		this.sessionId = options.sessionId
		this.participant = options.participant

		// Create recorders but don't initialize streams yet
		this.webcamRecorder = new VideoRecorder({
			sessionId: this.sessionId,
			type: "webcam",
			videoBitsPerSecond: 3000000,
		})

		this.screenRecorder = new VideoRecorder({
			sessionId: this.sessionId,
			type: "screen",
			videoBitsPerSecond: 5000000,
		})
	}

	/**
	 * Set calibration data after recording has started
	 */
	async setInitialCalibration(data: CalibrationData): Promise<void> {
		this.initialCalibration = data

		try {
			const session = await getSession(this.sessionId)
			if (!session) throw new Error("Error getting session")
			session.initialCalibration = data
			await storeSession(session)
		} catch (error) {
			console.error("Failed to update session with calibration data:", error)
		}
	}

	/**
	 * Initialize streams and get permissions (does NOT start writing to disk)
	 * This allows UI to show previews and user to select screens before recording starts
	 */
	async initializeStreams(): Promise<{
		webcamStream: MediaStream
		screenStream: MediaStream
		webcamMimeType: string
		screenMimeType: string
		screenResolution: { width: number; height: number }
		screenStreamResolution: { width: number; height: number }
		webcamResolution: { width: number; height: number }
	}> {
		try {
			// Initialize both streams concurrently
			const [webcamStream, screenStream] = await Promise.all([
				this.webcamRecorder.initializeStream(),
				this.screenRecorder.initializeStream(),
			])

			// Get resolutions
			const [webcamResolution, screenStreamResolution] = await Promise.all([
				getStreamResolution(webcamStream),
				getStreamResolution(screenStream),
			])

			const screenResolution = {
				width: window.screen.width,
				height: window.screen.height,
			}

			const webcamMimeType = this.webcamRecorder.getMimeType()
			const screenMimeType = this.screenRecorder.getMimeType()

			return {
				webcamStream,
				screenStream,
				webcamMimeType,
				screenMimeType,
				screenResolution,
				screenStreamResolution,
				webcamResolution,
			}
		} catch (error) {
			// Clean up on error
			await this.cleanup()
			throw error
		}
	}

	/**
	 * Start recording to disk (IndexedDB) for both streams simultaneously
	 * Must call initializeStreams() first
	 */
	async startRecordingToDisk(): Promise<void> {
		if (this.isRecording) {
			throw new Error("Recording is already in progress")
		}

		try {
			// Start both recorders writing to disk simultaneously
			await Promise.all([
				this.webcamRecorder.startRecording(),
				this.screenRecorder.startRecording(),
			])

			// Set recording start time immediately after both recorders start
			this.recordingStartTime = Date.now()
			this.isRecording = true

			// Create and store the session in IndexedDB
			const webcamStream = this.webcamRecorder.getStream()
			const screenStream = this.screenRecorder.getStream()

			if (!webcamStream || !screenStream) {
				throw new Error("Streams not initialized")
			}

			const [webcamResolution, screenStreamResolution] = await Promise.all([
				getStreamResolution(webcamStream),
				getStreamResolution(screenStream),
			])

			const screenResolution = {
				width: window.screen.width,
				height: window.screen.height,
			}

			const session: RecordingSession = {
				sessionId: this.sessionId,
				participant: this.participant,
				recordingStartTime: this.recordingStartTime,
				screenResolution,
				screenStreamResolution,
				webcamResolution,
				status: "recording",
				webcamMimeType: this.webcamRecorder.getMimeType(),
				screenMimeType: this.screenRecorder.getMimeType(),
			}

			await storeSession(session)
		} catch (error) {
			// Clean up on error
			await this.cleanup()
			throw error
		}
	}

	/**
	 * Stop recording and finalize session
	 */
	async stopRecording(): Promise<void> {
		if (!this.isRecording) return

		try {
			// Stop both recorders
			await Promise.all([
				this.webcamRecorder?.stopRecording(),
				this.screenRecorder?.stopRecording(),
			])

			// Update session status
			const session = await getSession(this.sessionId)
			if (session) {
				session.status = "completed"
				await storeSession(session)
			}

			this.isRecording = false
		} catch (error) {
			console.error("Error stopping recording:", error)
			throw error
		} finally {
			await this.cleanup()
		}
	}

	/**
	 * Cleanup resources
	 */
	private async cleanup(): Promise<void> {
		// Note: We don't null out the recorders since they're created in constructor
		// Just stop any active streams
		const webcamStream = this.webcamRecorder.getStream()
		const screenStream = this.screenRecorder.getStream()

		webcamStream?.getTracks().forEach((track) => track.stop())
		screenStream?.getTracks().forEach((track) => track.stop())

		this.isRecording = false
	}

	/**
	 * Add a click event
	 */
	addClick(click: ClickData): void {
		this.clicks.push(click)
	}

	/**
	 * Set card positions (should be called when game starts)
	 */
	setCardPositions(positions: CardPosition[]): void {
		this.cardPositions = positions
	}

	/**
	 * Mark game start
	 */
	markGameStart(): void {
		this.gameStartTimestamp = Date.now()
	}

	/**
	 * Mark game end
	 */
	markGameEnd(): void {
		this.gameEndTimestamp = Date.now()
	}

	/**
	 * Update game metadata
	 */
	updateGameMetadata(metadata: Partial<GameMetadata>): void {
		this.gameMetadata = {
			...this.gameMetadata,
			...metadata,
		}
	}

	/**
	 * Get current recording duration in milliseconds
	 */
	getRecordingDuration(): number {
		if (!this.isRecording || this.recordingStartTime === 0) {
			return 0
		}
		return Date.now() - this.recordingStartTime
	}

	/**
	 * Get recording state
	 */
	getRecordingState(): {
		isRecording: boolean
		duration: number
		clickCount: number
	} {
		return {
			isRecording: this.isRecording,
			duration: this.getRecordingDuration(),
			clickCount: this.clicks.length,
		}
	}

	/**
	 * Get all collected data for export
	 */
	getCollectedData(): {
		sessionId: string
		participant: ParticipantInfo
		recordingStartTime: number
		recordingDuration: number
		initialCalibration: CalibrationData | null
		clicks: ClickData[]
		cardPositions: CardPosition[]
		gameStartTimestamp: number
		gameEndTimestamp: number
		gameMetadata: GameMetadata
	} {
		return {
			sessionId: this.sessionId,
			participant: this.participant,
			recordingStartTime: this.recordingStartTime,
			recordingDuration: Math.floor(this.getRecordingDuration() / 1000), // in seconds
			initialCalibration: this.initialCalibration,
			clicks: this.clicks,
			cardPositions: this.cardPositions,
			gameStartTimestamp: this.gameStartTimestamp,
			gameEndTimestamp: this.gameEndTimestamp,
			gameMetadata: this.gameMetadata,
		}
	}

	/**
	 * Get webcam stream (for preview)
	 */
	getWebcamStream(): MediaStream | null {
		return this.webcamRecorder?.getStream() || null
	}

	/**
	 * Get screen stream (for preview)
	 */
	getScreenStream(): MediaStream | null {
		return this.screenRecorder?.getStream() || null
	}

	/**
	 * Pause recording (both webcam and screen)
	 */
	pauseRecording(): void {
		this.webcamRecorder.pause()
		this.screenRecorder.pause()
	}

	/**
	 * Resume recording (both webcam and screen)
	 */
	resumeRecording(): void {
		this.webcamRecorder.resume()
		this.screenRecorder.resume()
	}
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 15)
	return `session-${timestamp}-${random}`
}
