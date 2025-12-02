import { useEffect, useState } from "react"
import { formatBytes, getEstimatedExportSize } from "@/lib/data-export"
import { deleteSession, getAllSessions } from "@/lib/indexed-db"
import type { RecordingSession } from "@/lib/types"

interface SessionCleanupDialogProps {
	onClose: () => void
}

export function SessionCleanupDialog({ onClose }: SessionCleanupDialogProps) {
	const [sessions, setSessions] = useState<RecordingSession[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [sessionSizes, setSessionSizes] = useState<Record<string, number>>({})
	const [deletingSession, setDeletingSession] = useState<string | null>(null)

	// Load incomplete sessions on mount
	useEffect(() => {
		const loadSessions = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const allSessions = await getAllSessions()
				// Filter for incomplete or error sessions only
				const incompleteSessions = allSessions.filter(
					(s) => s.status === "recording" || s.status === "error",
				)
				setSessions(incompleteSessions)

				// Calculate sizes for these bad sessions
				const sizes: Record<string, number> = {}
				for (const session of incompleteSessions) {
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
				setError(err instanceof Error ? err.message : "Failed to load sessions")
			} finally {
				setIsLoading(false)
			}
		}

		loadSessions()
	}, [])

	const handleDelete = async (sessionId: string) => {
		if (!confirm("Are you sure you want to delete this incomplete data?")) {
			return
		}

		setDeletingSession(sessionId)
		try {
			await deleteSession(sessionId)
			// Remove from UI list immediately
			setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
		} catch (err) {
			console.error("Failed to delete session:", err)
			setError(err instanceof Error ? err.message : "Failed to delete session")
		} finally {
			setDeletingSession(null)
		}
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString()
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-stone-900 border-4 border-red-900 rounded-xl shadow-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col relative">
				{/* Header */}
				<div className="flex justify-between items-start mb-6">
					<div>
						<h2 className="text-3xl font-bold text-red-100 mb-2">Incomplete Sessions</h2>
						<p className="text-stone-300 text-sm">
							The following sessions were interrupted (e.g., browser crash or refresh). <br />
							They contain incomplete data and should be deleted to free up disk space.
						</p>
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
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-800 border-t-red-500 mx-auto mb-4" />
							<p className="text-stone-400">Scanning storage...</p>
						</div>
					</div>
				)}

				{/* Error state */}
				{error && !isLoading && (
					<div className="mb-4 p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-200">
						{error}
					</div>
				)}

				{/* Empty state (All Clean) */}
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
							<h3 className="text-xl font-semibold text-stone-200 mb-2">All Clean!</h3>
							<p className="text-stone-400 text-sm">
								No incomplete sessions found. Your storage is healthy.
							</p>
						</div>
					</div>
				)}

				{/* Sessions list */}
				{!isLoading && sessions.length > 0 && (
					<div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
						{sessions.map((session) => (
							<div
								key={session.sessionId}
								className="bg-stone-950/50 border border-stone-800 hover:border-red-900 rounded-lg p-4 transition-colors flex items-center justify-between group"
							>
								<div>
									<div className="flex items-center gap-3 mb-1">
										<h3 className="text-lg font-semibold text-stone-200">
											{session.participant.name}
										</h3>
										<span className="px-2 py-0.5 rounded text-xs font-mono bg-red-950 text-red-300 border border-red-900">
											{session.status.toUpperCase()}
										</span>
									</div>
									<div className="text-sm text-stone-500 space-x-4">
										<span>{formatDate(session.recordingStartTime)}</span>
										<span>•</span>
										<span className="text-stone-300">
											{sessionSizes[session.sessionId]
												? formatBytes(sessionSizes[session.sessionId])
												: "Calculating..."}
										</span>
									</div>
								</div>

								<button
									type="button"
									onClick={() => handleDelete(session.sessionId)}
									disabled={deletingSession === session.sessionId}
									className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white font-semibold rounded-lg transition-all border border-red-900 flex items-center gap-2"
								>
									{deletingSession === session.sessionId ? (
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
											Delete Data
										</>
									)}
								</button>
							</div>
						))}
					</div>
				)}

				{/* Close button */}
				<div className="flex justify-end pt-4 border-t border-stone-800">
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-lg transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
