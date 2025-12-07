import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { AlertIcon, CheckmarkIcon, LoadingIcon, RecorderIcon } from "./icons"

interface WebcamPreviewProps {
	onStreamReady?: (stream: MediaStream) => void
	onPermissionGranted?: () => void
	onPermissionDenied?: (error: Error) => void
}

export function WebcamPreview({
	onStreamReady,
	onPermissionGranted,
	onPermissionDenied,
}: WebcamPreviewProps) {
	const { t } = useTranslation()
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [hasPermission, setHasPermission] = useState(false)
	const [localStream, setLocalStream] = useState<MediaStream | null>(null)
	const hasInitialized = useRef(false)
	const handleStreamReady = useEffectEvent((stream: MediaStream) => onStreamReady?.(stream))
	const handlePermissionGranted = useEffectEvent(() => onPermissionGranted?.())
	const handlePermissionDenied = useEffectEvent((err: Error) => onPermissionDenied?.(err))

	const initWebcam = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					frameRate: { ideal: 30 },
				},
				audio: false,
			})

			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream
			}

			setLocalStream(mediaStream)
			setHasPermission(true)
			handlePermissionGranted()
			handleStreamReady(mediaStream)
		} catch (err) {
			const error = err as Error
			console.error("Webcam permission error:", error)

			let errorMessage: string = t.errors.webcamGeneric
			if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
				errorMessage = t.errors.webcamPermissionDenied as string
			} else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
				errorMessage = t.errors.webcamNotFound as string
			} else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
				errorMessage = t.errors.webcamInUse as string
			}

			setError(errorMessage)
			handlePermissionDenied?.(error)
		} finally {
			setIsLoading(false)
		}
	}, [t])

	// Auto-request webcam permission on mount
	useEffect(() => {
		if (hasInitialized.current) return
		hasInitialized.current = true
		initWebcam()
	}, [initWebcam])

	// Wire up video stream
	useEffect(() => {
		if (!videoRef.current || !localStream) return
		videoRef.current.srcObject = localStream
		return () => {
			if (videoRef.current) {
				videoRef.current.srcObject = null
			}
			localStream.getTracks().forEach((track) => {
				track.stop()
			})
		}
	}, [localStream])

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-amber-600 p-6 relative overflow-hidden">
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400" />

				<h3 className="text-2xl font-bold text-amber-100 mb-4 text-center">
					{t.webcamSetup.title}
				</h3>

				{/* Video preview */}
				<div className="relative bg-stone-950 rounded-lg overflow-hidden aspect-video mb-4">
					{localStream || hasPermission ? (
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className="w-full h-full object-cover scale-x-[-1]"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="text-center p-8">
								<RecorderIcon className="size-20 text-stone-600 mx-auto mb-4" />
								<p className="text-stone-400 text-lg">{t.webcamSetup.noWebcamMessage}</p>
							</div>
						</div>
					)}
				</div>

				{/* Error message */}
				{error && (
					<div className="mb-4 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
						<div className="flex items-start space-x-3">
							<AlertIcon className="size-6 text-red-400" />
							<div className="flex-1">
								<h4 className="text-red-300 font-semibold mb-1">{t.webcamSetup.errorTitle}</h4>
								<p className="text-red-200 text-sm">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Instructions */}
				<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-4">
					<h4 className="text-amber-100 font-semibold mb-2 flex items-center">
						<AlertIcon className="size-6 mr-3" />
						{t.webcamSetup.importantLabel}
					</h4>
					<ul className="list-disc list-inside space-y-1 text-stone-300 text-sm">
						<li>{t.webcamSetup.instruction1}</li>
						<li>{t.webcamSetup.instruction2}</li>
						<li>{t.webcamSetup.instruction3}</li>
					</ul>
				</div>

				{/* Request permission button */}
				{!localStream && !hasPermission && (
					<button
						type="button"
						onClick={initWebcam}
						disabled={isLoading}
						className="w-full group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10 flex items-center justify-center">
							{isLoading ? (
								<>
									<LoadingIcon className="-ml-1 mr-3 size-5" />
									{t.webcamSetup.requestingAccess}
								</>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									{t.webcamSetup.enableButton}
								</>
							)}
						</span>
					</button>
				)}

				{/* Success message */}
				{(localStream || hasPermission) && !error && (
					<div className="flex items-center justify-center space-x-2 text-green-400">
						<CheckmarkIcon className="size-5" />
						<span className="font-semibold">{t.webcamSetup.readyMessage}</span>
					</div>
				)}
			</div>
		</div>
	)
}
