/**
 * IndexedDB infrastructure for storing video chunks and session data
 */

import type { RecordingSession, VideoChunk } from "./types"

const DB_NAME = "GazeExperimentDB"
const DB_VERSION = 1
const VIDEO_CHUNKS_STORE = "videoChunks"
const SESSIONS_STORE = "sessions"

// Singleton to hold the database connection
let dbInstance: IDBDatabase | null = null
// Singleton to hold the pending connection request (prevent race conditions)
let dbOpenPromise: Promise<IDBDatabase> | null = null

/**
 * Initialize and open the IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
	if (dbInstance) return dbInstance
	if (dbOpenPromise) return dbOpenPromise

	// Start a new connection
	dbOpenPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onerror = () => {
			dbOpenPromise = null // reset on failure so we can try again
			reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
		}

		request.onsuccess = () => {
			dbInstance = request.result

			// Generic error handler for the DB connection
			dbInstance.onversionchange = () => {
				dbInstance?.close()
				dbInstance = null
				dbOpenPromise = null
			}

			resolve(dbInstance)
		}

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result

			// Video chunks store
			if (!db.objectStoreNames.contains(VIDEO_CHUNKS_STORE)) {
				const chunksStore = db.createObjectStore(VIDEO_CHUNKS_STORE, {
					keyPath: "id",
					autoIncrement: true,
				})
				chunksStore.createIndex("sessionId", "sessionId", { unique: false })
				chunksStore.createIndex("type", "type", { unique: false })
				chunksStore.createIndex("sessionType", ["sessionId", "type"], {
					unique: false,
				})
			}

			// Sessions store
			if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
				db.createObjectStore(SESSIONS_STORE, {
					keyPath: "sessionId",
				})
			}
		}
	})

	return dbOpenPromise
}

/**
 * Store a video chunk in IndexedDB
 */
export async function storeVideoChunk(chunk: VideoChunk): Promise<void> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readwrite")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)

		// Note: We don't await this. We let it run for efficiency (high frequency video chunks)
		const request = store.add(chunk)

		request.onsuccess = () => resolve()
		request.onerror = () =>
			reject(new Error(`Failed to store video chunk: ${request.error?.message}`))
	})
}

/**
 * Get all video chunks for a session
 */
export async function getVideoChunks(
	sessionId: string,
	type: "webcam" | "screen",
): Promise<VideoChunk[]> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readonly")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = store.index("sessionType")
		const request = index.getAll([sessionId, type])

		request.onsuccess = () => {
			const chunks = request.result as VideoChunk[]
			// Sort is needed because IndexedDB doesn't guarantee insertion order if transactions complete asynchronously
			chunks.sort((a, b) => a.timestamp - b.timestamp)
			resolve(chunks)
		}
		request.onerror = () =>
			reject(new Error(`Failed to get video chunks: ${request.error?.message}`))
	})
}

/**
 * Store or update a recording session
 */
export async function storeSession(session: RecordingSession): Promise<void> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([SESSIONS_STORE], "readwrite")
		const store = transaction.objectStore(SESSIONS_STORE)
		const request = store.put(session)

		request.onsuccess = () => resolve()
		request.onerror = () => reject(new Error(`Failed to store session: ${request.error?.message}`))
	})
}

/**
 * Get a recording session by ID
 */
export async function getSession(sessionId: string): Promise<RecordingSession | undefined> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([SESSIONS_STORE], "readonly")
		const store = transaction.objectStore(SESSIONS_STORE)
		const request = store.get(sessionId)

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(new Error(`Failed to get session: ${request.error?.message}`))
	})
}

/**
 * Get all recording sessions
 */
export async function getAllSessions(): Promise<RecordingSession[]> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([SESSIONS_STORE], "readonly")
		const store = transaction.objectStore(SESSIONS_STORE)
		const request = store.getAll()

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(new Error(`Failed to get sessions: ${request.error?.message}`))
	})
}

/**
 * Delete a session and all its video chunks
 */
export async function deleteSession(sessionId: string): Promise<void> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([SESSIONS_STORE, VIDEO_CHUNKS_STORE], "readwrite")
		let chunksDeleted = 0

		// Delete Session Metadata
		const sessionsStore = transaction.objectStore(SESSIONS_STORE)
		sessionsStore.delete(sessionId)

		// Delete Video Chunks via Index Cursor (This is the most efficient way to delete by non-primary key in IDB)
		const chunksStore = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = chunksStore.index("sessionId")
		const request = index.openCursor(IDBKeyRange.only(sessionId))

		request.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
			if (cursor) {
				cursor.delete()
				chunksDeleted++
				cursor.continue()
			}
		}

		transaction.oncomplete = () => {
			console.log(`Deleted session ${sessionId} and ${chunksDeleted} chunks`)
			resolve()
		}

		transaction.onerror = () =>
			reject(new Error(`Failed to delete session: ${transaction.error?.message}`))
	})
}

/**
 * Clear all data from the database
 */
export async function clearAllData(): Promise<void> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([SESSIONS_STORE, VIDEO_CHUNKS_STORE], "readwrite")

		transaction.objectStore(SESSIONS_STORE).clear()
		transaction.objectStore(VIDEO_CHUNKS_STORE).clear()

		transaction.oncomplete = () => resolve()
		transaction.onerror = () =>
			reject(new Error(`Failed to clear data: ${transaction.error?.message}`))
	})
}

/**
 * Get database size estimate
 */
export async function getStorageEstimate(): Promise<{
	usage: number
	quota: number
	percentage: number
}> {
	if (!navigator.storage || !navigator.storage.estimate) {
		return { usage: 0, quota: 0, percentage: 0 }
	}

	try {
		const estimate = await navigator.storage.estimate()
		const usage = estimate.usage || 0
		const quota = estimate.quota || 0
		const percentage = quota > 0 ? (usage / quota) * 100 : 0

		return { usage, quota, percentage }
	} catch (error) {
		console.warn("Storage estimate failed:", error)
		return { usage: 0, quota: 0, percentage: 0 }
	}
}

/**
 * Calculate total size of video chunks for a session efficiently
 * Uses a cursor to avoid loading blobs into memory
 */
export async function calculateSessionVideoSize(sessionId: string): Promise<number> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readonly")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = store.index("sessionId")
		const request = index.openCursor(IDBKeyRange.only(sessionId))

		let totalSize = 0

		request.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
			if (cursor) {
				// Browsers are smart enough not to load the full Blob binary into RAM
				// if we only touch the .size property.
				const chunk = cursor.value
				totalSize += chunk.data.size
				cursor.continue()
			} else {
				resolve(totalSize)
			}
		}

		request.onerror = () => reject(new Error("Failed to calculate session video size"))
	})
}

/**
 * Get the timestamp of the very first chunk for a specific stream
 */
export async function getFirstChunkTimestamp(
	sessionId: string,
	type: "webcam" | "screen",
): Promise<number | null> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readonly")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = store.index("sessionType")

		// Get only the first record
		const request = index.openCursor(IDBKeyRange.only([sessionId, type]), "next")

		request.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
			if (cursor) {
				resolve(cursor.value.timestamp)
			} else {
				resolve(null)
			}
		}

		request.onerror = () => reject(new Error("Failed to get first chunk timestamp"))
	})
}

/**
 * Get the offset of the very first chunk for a specific stream
 */
export async function getFirstChunkOffset(
	sessionId: string,
	type: "webcam" | "screen",
): Promise<number | null> {
	const db = await initDB()

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readonly")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = store.index("sessionType")

		// Get only the first record
		const request = index.openCursor(IDBKeyRange.only([sessionId, type]), "next")

		request.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
			if (cursor) {
				if (!cursor.value.chunkOffset && cursor.value.chunkOffset !== 0) {
					throw new Error("Expected chunkOffset")
				}
				resolve(cursor.value.chunkOffset)
			} else {
				resolve(null)
			}
		}

		request.onerror = () => reject(new Error("Failed to get first chunk timestamp"))
	})
}

/**
 * Count total chunks for a session
 */
export async function countVideoChunks(
	sessionId: string,
	type: "webcam" | "screen",
): Promise<number> {
	const db = await initDB()
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VIDEO_CHUNKS_STORE], "readonly")
		const store = transaction.objectStore(VIDEO_CHUNKS_STORE)
		const index = store.index("sessionType")
		const request = index.count(IDBKeyRange.only([sessionId, type]))

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(new Error("Failed to count chunks"))
	})
}
