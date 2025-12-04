import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ClickTracker } from "./click-tracker"
import { generateSessionId, RecordingManager } from "./recording-manager"
import type {
	CalibrationData,
	CardPosition,
	ClickData,
	GameMetadata,
	ParticipantInfo,
} from "./types"

interface RecordingState {
	// Session data
	sessionId: string | null
	participant: ParticipantInfo | null
	calibrationData: CalibrationData | null

	// Recording manager
	recordingManager: RecordingManager | null
	clickTracker: ClickTracker | null

	// Recording status
	isRecording: boolean
	isPaused: boolean
	recordingStartTime: number
	recordingDuration: number

	// Video streams
	webcamStream: MediaStream | null
	screenStream: MediaStream | null
	webcamMimeType: string | undefined
	screenMimeType: string | undefined

	// Game data
	clicks: ClickData[]
	cardPositions: CardPosition[]
	gameStartTimestamp: number
	gameEndTimestamp: number
	gameMetadata: GameMetadata

	// UI state
	showParticipantDialog: boolean
	showWebcamPreview: boolean
	showCalibration: boolean
	showExportDialog: boolean
	hasCompletedSetup: boolean

	// Actions
	setParticipant: (participant: ParticipantInfo) => void
	setCalibrationData: (calibration: CalibrationData) => void
	startVideoStreams: () => Promise<void>
	finalizeSetup: () => Promise<void>
	stopRecording: () => Promise<void>
	pauseRecording: () => void
	resumeRecording: () => void
	addClick: (click: ClickData) => void
	setCardPositions: (positions: CardPosition[]) => void
	markGameStart: () => void
	markGameEnd: () => void
	updateGameMetadata: (metadata: Partial<GameMetadata>) => void
	resetSession: (softReset?: boolean) => void

	// UI actions
	setShowParticipantDialog: (show: boolean) => void
	setShowWebcamPreview: (show: boolean) => void
	setShowCalibration: (show: boolean) => void
	setShowExportDialog: (show: boolean) => void
	completeSetup: () => void
}

export const useRecordingStore = create<RecordingState>()(
	persist(
		(set, get) => ({
			// Initial state
			sessionId: null,
			participant: null,
			calibrationData: null,
			recordingManager: null,
			clickTracker: null,
			isRecording: false,
			isPaused: false,
			recordingStartTime: 0,
			recordingDuration: 0,
			webcamStream: null,
			screenStream: null,
			webcamMimeType: undefined,
			screenMimeType: undefined,
			clicks: [],
			cardPositions: [],
			gameStartTimestamp: 0,
			gameEndTimestamp: 0,
			gameMetadata: {
				duration: 0,
				totalMoves: 0,
				totalMatches: 0,
				totalExplicitClicks: 0,
				totalImplicitClicks: 0,
			},
			showParticipantDialog: false,
			showWebcamPreview: false,
			showCalibration: false,
			showExportDialog: false,
			hasCompletedSetup: false,

			// Actions
			setParticipant: (participant) => {
				set({ participant })
			},

			setCalibrationData: (calibration) => {
				set({ calibrationData: calibration })
			},

			startVideoStreams: async () => {
				const { participant, isRecording } = get()

				if (!participant) {
					throw new Error("Participant info is required")
				}

				if (isRecording) {
					throw new Error("Recording is already in progress")
				}

				try {
					const sessionId = generateSessionId()
					const manager = new RecordingManager({
						sessionId,
						participant,
					})
					const { webcamStream, screenStream, webcamMimeType, screenMimeType } =
						await manager.startRecording()
					const recordingStartTime = Date.now()

					set({
						sessionId,
						recordingManager: manager,
						isRecording: true,
						isPaused: false,
						recordingStartTime,
						webcamStream,
						screenStream,
						webcamMimeType,
						screenMimeType,
					})
				} catch (error) {
					console.error("Failed to start video streams:", error)
					throw error
				}
			},

			finalizeSetup: async () => {
				const { participant, calibrationData, sessionId, recordingManager, recordingStartTime } =
					get()

				if (!participant || !calibrationData) {
					throw new Error("Participant info and calibration data are required")
				}

				if (!sessionId || !recordingManager) {
					throw new Error("Video streams must be started first")
				}

				try {
					await recordingManager.setInitialCalibration(calibrationData)

					// Create click tracker attached to current session
					const tracker = new ClickTracker({
						sessionId,
						recordingStartTime,
						onClickCapture: (click) => {
							get().addClick(click)
						},
					})
					tracker.start()

					set({
						clickTracker: tracker,
					})
				} catch (error) {
					console.error("Failed to finalize recording:", error)
					throw error
				}
			},

			stopRecording: async () => {
				const { recordingManager, clickTracker } = get()

				await recordingManager?.stopRecording()
				clickTracker?.stop()

				// Stop streams explicitly to be safe (manager should have handled it)
				const { webcamStream, screenStream } = get()
				webcamStream?.getTracks().forEach((track) => void track.stop())
				screenStream?.getTracks().forEach((track) => void track.stop())

				set({
					isRecording: false,
					recordingDuration: get().recordingManager?.getRecordingDuration() || 0,
					webcamStream: null,
					screenStream: null,
				})
			},

			pauseRecording: () => {
				const { recordingManager } = get()
				if (recordingManager) {
					recordingManager.pauseRecording()
					set({ isPaused: true })
				}
			},

			resumeRecording: () => {
				const { recordingManager } = get()
				if (recordingManager) {
					recordingManager.resumeRecording()
					set({ isPaused: false })
				}
			},

			addClick: (click) => {
				const { recordingManager, clicks } = get()

				// Add to local state
				set({ clicks: [...clicks, click] })

				// Add to manager
				recordingManager?.addClick(click)

				// Update game metadata
				const explicitClicks =
					clicks.filter((c) => c.type === "explicit").length + (click.type === "explicit" ? 1 : 0)
				const implicitClicks =
					clicks.filter((c) => c.type === "implicit").length + (click.type === "implicit" ? 1 : 0)

				get().updateGameMetadata({
					totalExplicitClicks: explicitClicks,
					totalImplicitClicks: implicitClicks,
				})
			},

			setCardPositions: (positions) => {
				set({ cardPositions: positions })
				const { recordingManager } = get()
				recordingManager?.setCardPositions(positions)
			},

			markGameStart: () => {
				const timestamp = Date.now()
				set({ gameStartTimestamp: timestamp })
				const { recordingManager } = get()
				recordingManager?.markGameStart()
			},

			markGameEnd: () => {
				const timestamp = Date.now()
				set({ gameEndTimestamp: timestamp })
				const { recordingManager } = get()
				recordingManager?.markGameEnd()

				// Calculate final duration
				const { gameStartTimestamp } = get()
				const duration = Math.floor((timestamp - gameStartTimestamp) / 1000)
				get().updateGameMetadata({ duration })
			},

			updateGameMetadata: (metadata) => {
				set((state) => ({
					gameMetadata: {
						...state.gameMetadata,
						...metadata,
					},
				}))

				const { recordingManager } = get()
				if (recordingManager) {
					recordingManager.updateGameMetadata(metadata)
				}
			},

			resetSession: (softReset = false) => {
				const { clickTracker, webcamStream, screenStream, participant } = get()

				// Clean up
				clickTracker?.stop()
				// Note: We don't stop recordingManager recorders here automatically
				// to allow for data export, but streams should be stopped.
				webcamStream?.getTracks().forEach((track) => void track.stop())
				screenStream?.getTracks().forEach((track) => void track.stop())

				set({
					sessionId: null,
					participant: softReset ? participant : null,
					calibrationData: null,
					recordingManager: null,
					clickTracker: null,
					isRecording: false,
					isPaused: false,
					recordingStartTime: 0,
					recordingDuration: 0,
					webcamStream: null,
					screenStream: null,
					clicks: [],
					cardPositions: [],
					gameStartTimestamp: 0,
					gameEndTimestamp: 0,
					gameMetadata: {
						duration: 0,
						totalMoves: 0,
						totalMatches: 0,
						totalExplicitClicks: 0,
						totalImplicitClicks: 0,
					},
					showParticipantDialog: false,
					showWebcamPreview: false,
					showCalibration: false,
					showExportDialog: false,
					hasCompletedSetup: false,
				})
			},

			// UI actions
			setShowParticipantDialog: (show) => set({ showParticipantDialog: show }),
			setShowWebcamPreview: (show) => set({ showWebcamPreview: show }),
			setShowCalibration: (show) => set({ showCalibration: show }),
			setShowExportDialog: (show) => set({ showExportDialog: show }),
			completeSetup: () => set({ hasCompletedSetup: true }),
		}),
		{
			name: "recording-storage",
			// Only persist participant info to survive page refreshes
			partialize: (state) => ({
				participant: state.participant,
			}),
		},
	),
)
