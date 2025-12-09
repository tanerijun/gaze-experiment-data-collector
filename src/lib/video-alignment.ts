/**
 * Video Alignment Utilities
 *
 * Calculates the exact offset needed to align webcam and screen recordings
 * at their start points, accounting for the fact that MediaRecorder delivers
 * first chunks at different times for each stream.
 */

import {
	countVideoChunks,
	getFirstChunkOffset,
	getFirstChunkTimestamp,
	getSession,
} from "./indexed-db"

export interface VideoAlignmentInfo {
	sessionId: string
	recordingStartTime: number
	webcam: {
		firstChunkTime: number
		offsetFromStart: number
		totalChunks: number
	}
	screen: {
		firstChunkTime: number
		offsetFromStart: number
		totalChunks: number
	}
	alignment: {
		webcamLeadsBy: number // Positive if webcam started first (ms)
		screenLeadsBy: number // Positive if screen started first (ms)
		trimWebcamBy: number // Amount to trim from webcam start (ms)
		trimScreenBy: number // Amount to trim from screen start (ms)
	}
}

/**
 * Calculate alignment offsets for a recording session
 */
export async function calculateVideoAlignment(
	sessionId: string,
): Promise<VideoAlignmentInfo | null> {
	// Get session metadata
	const session = await getSession(sessionId)
	if (!session) {
		return null
	}

	const [webcamOffset, screenOffset, webcamStart, screenStart] = await Promise.all([
		getFirstChunkOffset(sessionId, "webcam"),
		getFirstChunkOffset(sessionId, "screen"),
		getFirstChunkTimestamp(sessionId, "webcam"),
		getFirstChunkTimestamp(sessionId, "screen"),
	])

	console.log("Alignment debug:", {
		webcamOffset,
		screenOffset,
		webcamStart,
		screenStart,
	})

	// If either stream failed to record even a single chunk, we can't align
	if (webcamOffset === null || screenOffset === null || !webcamStart || !screenStart) {
		return null
	}

	// Get chunk counts
	const [webcamCount, screenCount] = await Promise.all([
		countVideoChunks(sessionId, "webcam"),
		countVideoChunks(sessionId, "screen"),
	])

	// Calculate Alignment
	const webcamLeadsBy = Math.max(0, screenOffset - webcamOffset)
	const screenLeadsBy = Math.max(0, webcamOffset - screenOffset)

	return {
		sessionId,
		recordingStartTime: session.recordingStartTime,
		webcam: {
			firstChunkTime: webcamStart,
			offsetFromStart: webcamOffset,
			totalChunks: webcamCount,
		},
		screen: {
			firstChunkTime: screenStart,
			offsetFromStart: screenOffset,
			totalChunks: screenCount,
		},
		alignment: {
			webcamLeadsBy,
			screenLeadsBy,
			trimWebcamBy: webcamLeadsBy,
			trimScreenBy: screenLeadsBy,
		},
	}
}
