/**
 * Client-side upload utilities for Cloudflare R2 using presigned URLs
 */

import { getUploadUrl } from "@/server-functions/upload"
import { getSession, storeSession } from "./indexed-db"

export interface UploadProgress {
	loaded: number
	total: number
	percentage: number
}

export interface UploadOptions {
	onProgress?: (progress: UploadProgress) => void
	onSuccess?: () => void
	onError?: (error: Error) => void
}

/**
 * Upload a blob to R2 using a presigned URL (direct browser to R2)
 */
async function uploadBlobToR2(
	blob: Blob,
	uploadUrl: string,
	onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()

		xhr.open("PUT", uploadUrl)
		xhr.setRequestHeader("Content-Type", "application/zip")

		// Track upload progress
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable && onProgress) {
				const progress: UploadProgress = {
					loaded: event.loaded,
					total: event.total,
					percentage: (event.loaded / event.total) * 100,
				}
				onProgress(progress)
			}
		}

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve()
			} else {
				reject(new Error(`Upload failed with status: ${xhr.status}`))
			}
		}

		xhr.onerror = () => {
			reject(new Error("Network error during upload"))
		}

		xhr.ontimeout = () => {
			reject(new Error("Upload timeout"))
		}

		// Set a reasonable timeout (30 minutes for large files)
		xhr.timeout = 1800000

		xhr.send(blob)
	})
}

/**
 * Upload a session ZIP file to R2
 * This function:
 * 1. Gets a presigned URL from the server
 * 2. Uploads the blob directly to R2 (browser -> R2, no server in between)
 * 3. Updates the session state in IndexedDB on success
 */
export async function uploadSessionToR2(
	sessionId: string,
	zipBlob: Blob,
	filename: string,
	options?: UploadOptions,
): Promise<void> {
	try {
		// Get presigned upload URL from server
		const { uploadUrl } = await getUploadUrl({
			data: {
				sessionId,
				filename,
			},
		})

		// Upload directly to R2 with progress tracking
		await uploadBlobToR2(zipBlob, uploadUrl, options?.onProgress)

		// Mark session as uploaded in IndexedDB
		const session = await getSession(sessionId)
		if (session) {
			await storeSession({
				...session,
				status: "uploaded",
			})
		}

		console.log(`[UPLOAD SUCCESS] Uploaded ${filename} to R2`)
		options?.onSuccess?.()
	} catch (error) {
		const uploadError = error instanceof Error ? error : new Error("Unknown upload error")
		console.error("Upload failed:", uploadError)
		options?.onError?.(uploadError)
		throw uploadError
	}
}

/**
 * Format upload progress for display
 */
export function formatUploadProgress(progress: UploadProgress): string {
	const percentage = Math.round(progress.percentage)
	const loadedMB = (progress.loaded / (1024 * 1024)).toFixed(2)
	const totalMB = (progress.total / (1024 * 1024)).toFixed(2)
	return `${percentage}% (${loadedMB} MB / ${totalMB} MB)`
}

/**
 * Format file size for display
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
 * Check if browser supports the required upload features
 */
export function isUploadSupported(): boolean {
	return typeof XMLHttpRequest !== "undefined" && "upload" in XMLHttpRequest.prototype
}
