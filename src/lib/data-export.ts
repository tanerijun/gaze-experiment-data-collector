/**
 * Data export utilities for creating ZIP files with session data
 */

import JSZip from "jszip"
import { calculateSessionVideoSize, getVideoChunks } from "./indexed-db"
import type {
	CalibrationData,
	CardPosition,
	ClickData,
	GameMetadata,
	ParticipantInfo,
} from "./types"
import { calculateVideoAlignment } from "./video-alignment"

export interface ExportData {
	sessionId: string
	participant: ParticipantInfo
	recordingStartTime: number
	recordingDuration: number
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
	webcamMimeType?: string
	screenMimeType?: string
}

/**
 * Helper to determine file extension from MIME type
 */
function getExtension(mimeType?: string): string {
	if (!mimeType) return "webm" // Default fallback
	if (mimeType.includes("mp4")) return "mp4"
	if (mimeType.includes("x-matroska")) return "mkv"
	return "webm"
}

/**
 * Create a data package (ZIP file) with all session data
 */
export async function createDataPackage(exportData: ExportData): Promise<Blob> {
	const sessionId = exportData.sessionId

	// Get video chunks and alignment info from IndexedDB
	const [webcamChunks, screenChunks, alignmentInfo] = await Promise.all([
		getVideoChunks(sessionId, "webcam"),
		getVideoChunks(sessionId, "screen"),
		calculateVideoAlignment(sessionId),
	])

	const webcamExt = getExtension(exportData.webcamMimeType)
	const screenExt = getExtension(exportData.screenMimeType)

	// Combine chunks into blobs
	const webcamBlob = new Blob(
		webcamChunks.map((chunk) => chunk.data),
		{ type: "video/webm" },
	)
	const screenBlob = new Blob(
		screenChunks.map((chunk) => chunk.data),
		{ type: "video/webm" },
	)

	const exportDataWithAlignment = {
		...exportData,
		videoAlignment: alignmentInfo,
	}

	const jsonBlob = new Blob([JSON.stringify(exportDataWithAlignment, null, 2)], {
		type: "application/json",
	})

	// Create ZIP file
	const zip = new JSZip()
	zip.file(`webcam.${webcamExt}`, webcamBlob, { compression: "STORE" })
	zip.file(`screen.${screenExt}`, screenBlob, { compression: "STORE" })
	zip.file("metadata.json", jsonBlob, { compression: "DEFLATE" })

	// Generate ZIP
	const zipBlob = await zip.generateAsync({
		type: "blob",
		compression: "DEFLATE",
		compressionOptions: {
			level: 6,
		},
	})

	return zipBlob
}

/**
 * Download a ZIP file
 */
export function downloadZip(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

/**
 * Generate a filename for the export
 */
export function generateExportFilename(sessionId: string, participantName: string): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
	const sanitizedName = participantName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
	return `${sanitizedName}-${timestamp}-${sessionId}.zip`
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes"

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60

	const parts = []

	if (hours > 0) {
		parts.push(`${hours}h`)
	}
	if (minutes > 0) {
		parts.push(`${minutes}m`)
	}
	if (secs > 0 || parts.length === 0) {
		parts.push(`${secs}s`)
	}

	return parts.join(" ")
}

/**
 * Validate export data before creating package
 */
export function validateExportData(data: ExportData): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []

	if (!data.sessionId) {
		errors.push("Session ID is required")
	}

	if (!data.participant.name) {
		errors.push("Participant name is required")
	}

	if (!data.initialCalibration || data.initialCalibration.points.length === 0) {
		errors.push("Calibration data is missing or incomplete")
	}

	if (data.clicks.length === 0) {
		errors.push("No clicks recorded")
	}

	if (data.cardPositions.length === 0) {
		errors.push("Card positions not recorded")
	}

	if (data.recordingDuration === 0) {
		errors.push("Recording duration is zero")
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

/**
 * Get estimated export size
 */
export async function getEstimatedExportSize(sessionId: string): Promise<number> {
	try {
		const videoSize = await calculateSessionVideoSize(sessionId)
		// Estimated metadata overhead (~10KB is a safe buffer for JSON)
		const metadataOverhead = 10 * 1024
		return videoSize + metadataOverhead
	} catch (error) {
		console.error("Failed to estimate export size:", error)
		return 0
	}
}
