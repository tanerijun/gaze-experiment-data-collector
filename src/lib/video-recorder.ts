/**
 * Video recorder for webcam and screen recording with IndexedDB streaming
 */

import { storeVideoChunk } from "./indexed-db"
import type { VideoChunk } from "./types"

export interface VideoRecorderOptions {
	sessionId: string
	type: "webcam" | "screen"
	mimeType?: string
	videoBitsPerSecond?: number
}

export class VideoRecorder {
	private mediaRecorder: MediaRecorder | null = null
	private stream: MediaStream | null = null
	private sessionId: string
	private type: "webcam" | "screen"
	private startTime: number = 0
	private mimeType: string
	private videoBitsPerSecond: number
	private pendingWrites = new Set<Promise<void>>() // track active DB writes to prevent closing before saving finishes

	constructor(options: VideoRecorderOptions) {
		this.sessionId = options.sessionId
		this.type = options.type
		this.mimeType = options.mimeType || this.getDefaultMimeType()
		this.videoBitsPerSecond = options.videoBitsPerSecond || 2500000 // 2.5 Mbps default
	}

	/**
	 * Get the best supported MIME type
	 */
	private getDefaultMimeType(): string {
		const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]

		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) {
				return type
			}
		}

		return "video/webm"
	}

	/**
	 * Start recording from webcam
	 */
	async startWebcamRecording(): Promise<MediaStream> {
		if (this.type !== "webcam") {
			throw new Error("This recorder is not configured for webcam recording")
		}

		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					frameRate: { ideal: 30 },
				},
				audio: false,
			})

			await this.startRecording(this.stream)
			return this.stream
		} catch (error) {
			throw new Error(`Failed to start webcam recording: ${error}`)
		}
	}

	/**
	 * Start screen recording
	 */
	async startScreenRecording(): Promise<MediaStream> {
		if (this.type !== "screen") {
			throw new Error("This recorder is not configured for screen recording")
		}

		try {
			this.stream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					displaySurface: "window",
				},
				audio: false,
			})
			await this.startRecording(this.stream)
			return this.stream
		} catch (error) {
			if (error instanceof Error && error.name === "NotAllowedError") {
				throw new Error("Screen recording permission was denied")
			}
			throw new Error(`Failed to start screen recording: ${error}`)
		}
	}

	/**
	 * Start recording from a given stream
	 */
	private async startRecording(stream: MediaStream): Promise<void> {
		this.startTime = Date.now()

		const options: MediaRecorderOptions = {
			mimeType: this.mimeType,
			videoBitsPerSecond: this.videoBitsPerSecond,
		}

		this.mediaRecorder = new MediaRecorder(stream, options)

		// Handle data available event - stream chunks to IndexedDB
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data && event.data.size > 0) {
				// Don't await here (it blocks the event loop),
				// Instead, track the promise to ensure we don't close too early
				const writePromise = this.handleChunk(event.data)
				this.pendingWrites.add(writePromise)
				writePromise.finally(() => {
					this.pendingWrites.delete(writePromise)
				})
			}
		}

		// Handle errors
		this.mediaRecorder.onerror = (event) => {
			console.error(`MediaRecorder error (${this.type}):`, event)
		}

		// Request data every 1 second for streaming to IndexedDB
		this.mediaRecorder.start(1000)
	}

	/**
	 * Handle incoming video chunk - store in IndexedDB
	 */
	private async handleChunk(blob: Blob): Promise<void> {
		const chunk: VideoChunk = {
			sessionId: this.sessionId,
			type: this.type,
			timestamp: Date.now(),
			data: blob,
		}

		try {
			await storeVideoChunk(chunk)
		} catch (error) {
			console.error(`Failed to store ${this.type} chunk:`, error)
		}
	}

	/**
	 * Stop recording
	 */
	async stopRecording(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
				this.cleanupAndResolve(resolve)
				return
			}

			this.mediaRecorder.onstop = async () => {
				// WAIT for any pending DB writes
				if (this.pendingWrites.size > 0) {
					await Promise.all(this.pendingWrites)
				}
				this.cleanupAndResolve(resolve)
			}

			this.mediaRecorder.stop()
		})
	}

	/**
	 * Helper to clean up streams and resolve stop promise
	 */
	private cleanupAndResolve(resolve: () => void) {
		// Stop all tracks in the stream (turns off camera light)
		if (this.stream) {
			this.stream.getTracks().forEach((track) => void track.stop())
			this.stream = null
		}

		this.mediaRecorder = null
		this.pendingWrites.clear()
		resolve()
	}

	/**
	 * Get current recording state
	 */
	getState(): RecordingState {
		return this.mediaRecorder?.state || "inactive"
	}

	/**
	 * Get the media stream (useful for preview)
	 */
	getStream(): MediaStream | null {
		return this.stream
	}

	/**
	 * Get recording duration in milliseconds
	 */
	getDuration(): number {
		if (this.startTime === 0) return 0
		return Date.now() - this.startTime
	}

	/**
	 * Pause recording
	 */
	pause(): void {
		if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
			this.mediaRecorder.pause()
		}
	}

	/**
	 * Resume recording
	 */
	resume(): void {
		if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
			this.mediaRecorder.resume()
		}
	}
}

export type RecordingState = "inactive" | "recording" | "paused"

/**
 * Check if the browser supports the required APIs
 */
export function checkRecordingSupport(): {
	webcam: boolean
	screen: boolean
	mediaRecorder: boolean
} {
	return {
		webcam: !!navigator.mediaDevices?.getUserMedia,
		screen: !!navigator.mediaDevices?.getDisplayMedia,
		mediaRecorder: typeof MediaRecorder !== "undefined",
	}
}

/**
 * Get available video resolutions for a stream
 */
export async function getStreamResolution(
	stream: MediaStream,
): Promise<{ width: number; height: number }> {
	const videoTrack = stream.getVideoTracks()[0]
	if (!videoTrack) {
		return { width: 0, height: 0 }
	}

	const settings = videoTrack.getSettings()
	return {
		width: settings.width || 0,
		height: settings.height || 0,
	}
}
