import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import {
	createDataPackage,
	formatBytes,
	generateExportFilename,
	getEstimatedExportSize,
} from "@/lib/data-export"
import { deleteSession, getAllSessions } from "@/lib/indexed-db"
import type { RecordingSession } from "@/lib/types"
import { formatUploadProgress, type UploadProgress, uploadSessionToR2 } from "@/lib/upload"

interface SessionCleanupDialogProps {
	onClose: () => void
}

export function SessionCleanupDialog({ onClose }: SessionCleanupDialogProps) {
	const { t } = useTranslation()
	const [sessions, setSessions] = useState<RecordingSession[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [sessionSizes, setSessionSizes] = useState<Record<string, number>>({})
	const [deletingSession, setDeletingSession] = useState<string | null>(null)
	const [uploadingSession, setUploadingSession] = useState<string | null>(null)
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

	useEffect(() => {
		const load = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const allSessions = await getAllSessions()
				setSessions(allSessions)

				// Calculate sizes for all sessions
				const sizes: Record<string, number> = {}
				for (const session of allSessions) {
					try {
						const size = await getEstimatedExportSize(session.sessionId)
						sizes[session.sessionId] = size
					} catch (err) {
						console.error(`Failed to get size for session ${session.sessionId}:`, err)
						sizes[session.sessionId] = 0
					}
				}
				setSessionSizes(sizes)
			} catch (err) {
				console.error("Failed to load sessions:", err)
				setError(err instanceof Error ? err.message : t.errors.sessionLoadFailed)
			} finally {
				setIsLoading(false)
			}
		}
		load()
	}, [t])

	const handleDelete = async (sessionId: string) => {
		if (!confirm(t.sessionManager.deleteConfirm)) {
			return
		}

		setDeletingSession(sessionId)
		try {
			await deleteSession(sessionId)
			// Remove from UI list immediately
			setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
			// Also remove size
			setSessionSizes((prev) => {
				const newSizes = { ...prev }
				delete newSizes[sessionId]
				return newSizes
			})
		} catch (err) {
			console.error("Failed to delete session:", err)
			setError(err instanceof Error ? err.message : "Failed to delete session")
		} finally {
			setDeletingSession(null)
		}
	}

	const handleUpload = async (session: RecordingSession) => {
		setUploadingSession(session.sessionId)
		setError(null)
		setUploadProgress(null)

		try {
			// Package the data - use persisted data from IndexedDB or fallback to defaults
			const exportData = {
				sessionId: session.sessionId,
				participant: session.participant,
				recordingStartTime: session.recordingStartTime,
				recordingDuration: session.recordingDuration || 0,
				screenResolution: session.screenResolution,
				screenStreamResolution: session.screenStreamResolution,
				webcamResolution: session.webcamResolution,
				initialCalibration: session.initialCalibration || {
					points: [],
					screenWidth: session.screenResolution.width,
					screenHeight: session.screenResolution.height,
					startTimestamp: session.recordingStartTime,
					endTimestamp: session.recordingStartTime,
				},
				cardPositions: session.cardPositions || [],
				gameStartTimestamp: session.gameStartTimestamp || session.recordingStartTime,
				clicks: session.clicks || [],
				gameEndTimestamp: session.gameEndTimestamp || session.recordingStartTime,
				gameMetadata: session.gameMetadata || {
					duration: 0,
					totalMoves: 0,
					totalMatches: 0,
					totalExplicitClicks: 0,
					totalImplicitClicks: 0,
				},
				webcamMimeType: session.webcamMimeType,
				screenMimeType: session.screenMimeType,
			}

			// Warn if session is incomplete (no game data)
			const isIncomplete = !session.gameMetadata || !session.clicks || session.clicks.length === 0
			if (isIncomplete) {
				const confirmed = confirm(t.sessionManager.uploadIncompleteWarning)
				if (!confirmed) {
					setUploadingSession(null)
					return
				}
			}

			const zipBlob = await createDataPackage(exportData)
			const filename = generateExportFilename(session.sessionId, session.participant.name)

			await uploadSessionToR2(session.sessionId, zipBlob, filename, {
				onProgress: (prog) => {
					setUploadProgress(prog)
				},
				onSuccess: () => {
					// Update session status in UI
					setSessions((prev) =>
						prev.map((s) =>
							s.sessionId === session.sessionId ? { ...s, status: "uploaded" as const } : s,
						),
					)
					setUploadProgress(null)
					setUploadingSession(null)
				},
				onError: (err) => {
					setError(`Upload failed: ${err.message}`)
					setUploadProgress(null)
					setUploadingSession(null)
				},
			})
		} catch (err) {
			console.error("Upload error:", err)
			setError(err instanceof Error ? err.message : "Failed to upload session")
			setUploadProgress(null)
			setUploadingSession(null)
		}
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString()
	}

	const getStatusBadge = (status: RecordingSession["status"]) => {
		switch (status) {
			case "recording":
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-900/50 text-yellow-300 border border-yellow-700">
						{t.sessionManager.statusBadge.recording}
					</span>
				)
			case "completed":
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/50 text-blue-300 border border-blue-700">
						{t.sessionManager.statusBadge.completed}
					</span>
				)
			case "uploaded":
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-900/50 text-green-300 border border-green-700">
						{t.sessionManager.statusBadge.uploaded}
					</span>
				)
			case "error":
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-900/50 text-red-300 border border-red-700">
						{t.sessionManager.statusBadge.error}
					</span>
				)
			default:
				return null
		}
	}

	const getSessionDescription = (status: RecordingSession["status"], session: RecordingSession) => {
		const hasGameData = session.clicks && session.clicks.length > 0 && session.gameMetadata

		switch (status) {
			case "recording":
				return t.sessionManager.statusDescription.recording
			case "completed":
				if (!hasGameData) {
					return t.sessionManager.statusDescription.completedIncomplete
				}
				return t.sessionManager.statusDescription.completed
			case "uploaded":
				return t.sessionManager.statusDescription.uploaded
			case "error":
				return t.sessionManager.statusDescription.error
		}
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-stone-900 border-4 border-amber-900 rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col relative">
				{/* Header */}
				<div className="flex justify-between items-start mb-6">
					<div>
						<h2 className="text-3xl font-bold text-amber-100 mb-2">{t.sessionManager.title}</h2>
						<p className="text-stone-300">{t.sessionManager.description}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-stone-400 hover:text-white transition-colors p-2"
						aria-label="Close dialog"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="flex-1 flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-800 border-t-amber-500 mx-auto mb-4" />
							<p className="text-stone-400">{t.sessionManager.loadingMessage}</p>
						</div>
					</div>
				)}

				{/* Error state */}
				{error && !isLoading && (
					<div className="mb-4 p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-200">
						{error}
					</div>
				)}

				{/* Empty state */}
				{!isLoading && sessions.length === 0 && (
					<div className="flex-1 flex items-center justify-center py-12">
						<div className="text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 text-green-500 mx-auto mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<h3 className="text-xl font-semibold text-stone-200 mb-2">
								{t.sessionManager.noSessionsTitle}
							</h3>
							<p className="text-stone-400 text-sm">{t.sessionManager.noSessionsMessage}</p>
						</div>
					</div>
				)}

				{/* Sessions list */}
				{!isLoading && sessions.length > 0 && (
					<div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
						{sessions.map((session) => (
							<div
								key={session.sessionId}
								className="bg-stone-950/50 border border-stone-800 hover:border-amber-900 rounded-lg p-4 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-lg font-semibold text-stone-200">
												{session.participant.name}
											</h3>
											{getStatusBadge(session.status)}
											{session.status === "completed" &&
												(!session.clicks || session.clicks.length === 0) && (
													<span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-950 text-yellow-300 border border-yellow-900">
														⚠️ NO GAME DATA
													</span>
												)}
										</div>
										<div className="text-sm text-stone-400 mb-2">
											<p>{getSessionDescription(session.status, session)}</p>
										</div>
										<div className="text-sm text-stone-500 space-x-4">
											<span>{formatDate(session.recordingStartTime)}</span>
											<span>•</span>
											<span className="text-stone-300">
												{t.sessionManager.sizeLabel}{" "}
												{sessionSizes[session.sessionId]
													? formatBytes(sessionSizes[session.sessionId])
													: "..."}
											</span>
											<span>•</span>
											<span className="font-mono text-xs">{session.sessionId.slice(0, 8)}...</span>
										</div>
									</div>

									<div className="flex flex-col gap-2">
										{/* Upload button for completed sessions */}
										{session.status === "completed" && (
											<button
												type="button"
												onClick={() => handleUpload(session)}
												disabled={
													uploadingSession === session.sessionId ||
													deletingSession === session.sessionId
												}
												className="px-4 py-2 bg-green-900/50 hover:bg-green-900 text-green-200 hover:text-white font-semibold rounded-lg transition-all border border-green-900 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{uploadingSession === session.sessionId ? (
													<>
														<svg
															className="animate-spin h-4 w-4"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
														>
															<circle
																className="opacity-25"
																cx="12"
																cy="12"
																r="10"
																stroke="currentColor"
																strokeWidth="4"
															/>
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
															/>
														</svg>
														{t.sessionManager.uploadingButton}
													</>
												) : (
													<>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-4 w-4"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
															/>
														</svg>
														{t.sessionManager.uploadButton}
													</>
												)}
											</button>
										)}

										{/* Delete button for all sessions */}
										<button
											type="button"
											onClick={() => handleDelete(session.sessionId)}
											disabled={
												deletingSession === session.sessionId ||
												uploadingSession === session.sessionId
											}
											className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white font-semibold rounded-lg transition-all border border-red-900 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{deletingSession === session.sessionId ? (
												<>
													<svg
														className="animate-spin h-4 w-4"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														/>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														/>
													</svg>
													{t.sessionManager.deletingButton}
												</>
											) : (
												<>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
													{t.sessionManager.deleteButton}
												</>
											)}
										</button>
									</div>
								</div>

								{/* Upload progress for this session */}
								{uploadingSession === session.sessionId && uploadProgress && (
									<div className="mt-3 pt-3 border-t border-stone-800">
										<div className="flex justify-between text-xs text-stone-400 mb-1">
											<span>{t.sessionManager.uploadProgress}</span>
											<span>{Math.round(uploadProgress.percentage)}%</span>
										</div>
										<div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
											<div
												className="h-full bg-linear-to-r from-green-600 to-emerald-500 transition-all duration-300"
												style={{ width: `${uploadProgress.percentage}%` }}
											/>
										</div>
										<p className="text-xs text-stone-500 mt-1">
											{formatUploadProgress(uploadProgress)}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				)}

				{/* Footer */}
				<div className="flex justify-between items-center pt-4 border-t border-stone-800">
					<div className="text-sm text-stone-400">
						{sessions.length > 0 && (
							<span>
								{sessions.length} session{sessions.length !== 1 ? "s" : ""} •{" "}
								{formatBytes(Object.values(sessionSizes).reduce((sum, size) => sum + size, 0))}{" "}
								total
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="w-full px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900 active:scale-95"
					>
						{t.common.close}
					</button>
				</div>
			</div>
		</div>
	)
}
