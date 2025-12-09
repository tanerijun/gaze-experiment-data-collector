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
		const types = [
			"video/mp4;codecs=avc1,mp4a.40.2",
			"video/mp4",
			"video/webm;codecs=vp9,opus",
			"video/webm;codecs=vp8,opus",
			"video/webm",
		]

		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) {
				return type
			}
		}

		return "video/webm"
	}

	/**
	 * Get the actual MIME type being used
	 */
	getMimeType(): string {
		return this.mimeType
	}

	/**
	 * Initialize stream and get permissions (does NOT start recording to disk)
	 * Returns the stream for preview purposes
	 */
	async initializeStream(): Promise<MediaStream> {
		if (this.stream) {
			// Stream already initialized
			return this.stream
		}

		try {
			if (this.type === "webcam") {
				this.stream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: { ideal: 1280 },
						height: { ideal: 720 },
						frameRate: { ideal: 30 },
					},
					audio: false,
				})
			} else if (this.type === "screen") {
				this.stream = await navigator.mediaDevices.getDisplayMedia({
					video: {
						displaySurface: "monitor",
					},
					// @ts-expect-error: it exists
					monitorTypeSurfaces: "include",
					audio: false,
				})

				const track = this.stream.getVideoTracks()[0]
				const settings = track.getSettings()

				// Force share "entire screen"
				if (settings.displaySurface && settings.displaySurface !== "monitor") {
					track.stop()
					this.stream = null
					throw new Error("INVALID_SURFACE")
				}
			}

			if (!this.stream) {
				throw new Error("Failed to initialize stream")
			}

			return this.stream
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "INVALID_SURFACE") {
					throw new Error("You selected a Window or Tab. Please select 'Entire Screen'.")
				}
				if (error.name === "NotAllowedError") {
					throw new Error(
						`${this.type === "webcam" ? "Webcam" : "Screen recording"} permission was denied`,
					)
				}
			}
			throw new Error(`Failed to initialize ${this.type} stream: ${error}`)
		}
	}

	/**
	 * Start recording to disk (IndexedDB)
	 * Must call initializeStream() first
	 */
	async startRecording(): Promise<void> {
		if (!this.stream) {
			throw new Error("Stream not initialized. Call initializeStream() first.")
		}

		if (this.mediaRecorder) {
			throw new Error("Recording already started")
		}

		this.startTime = Date.now()

		const options: MediaRecorderOptions = {
			mimeType: this.mimeType,
			videoBitsPerSecond: this.videoBitsPerSecond,
		}

		this.mediaRecorder = new MediaRecorder(this.stream, options)

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
			chunkOffset: Date.now() - this.startTime,
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
