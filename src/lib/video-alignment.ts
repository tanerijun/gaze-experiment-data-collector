/**
 * Video Alignment Utilities
 *
 * Calculates the exact offset needed to align webcam and screen recordings
 * at their start points, accounting for the fact that MediaRecorder delivers
 * first chunks at different times for each stream.
 */

import { countVideoChunks, getFirstChunkTimestamp, getSession } from "./indexed-db"

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

	// Get ONLY the start timestamps (Efficient)
	const [webcamStart, screenStart] = await Promise.all([
		getFirstChunkTimestamp(sessionId, "webcam"),
		getFirstChunkTimestamp(sessionId, "screen"),
	])

	// If either stream failed to record even a single chunk, we can't align
	if (!webcamStart || !screenStart) {
		return null
	}

	// Get chunk counts
	const [webcamCount, screenCount] = await Promise.all([
		countVideoChunks(sessionId, "webcam"),
		countVideoChunks(sessionId, "screen"),
	])

	// Calculate Offsets
	const webcamOffset = webcamStart - session.recordingStartTime
	const screenOffset = screenStart - session.recordingStartTime

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
