/**
 * Localization strings for the application
 * All text content is organized by screen/component for easy reference
 */

export const EN = {
	// Common UI elements
	common: {
		close: "Close",
		cancel: "Cancel",
		continue: "Continue",
		back: "Back",
		confirm: "Confirm",
		ok: "OK",
		yes: "Yes",
		no: "No",
		error: "Error",
		success: "Success",
		loading: "Loading...",
		required: "*",
	},

	// Main Menu / Landing Page
	mainMenu: {
		title: "The Deep Vault",
		subtitle: "Gaze Estimation Experiment Platform",
		aboutButton: {
			title: "1. ABOUT",
			descriptionWithConsent: "Review data collection information",
			descriptionNoConsent: "Read about data collection & consent",
			consentedBadge: "✓ Consented",
		},
		participantButton: {
			title: "2. PARTICIPANT INFO",
			descriptionComplete: "Click to edit information",
			descriptionIncomplete: "Enter your information",
			descriptionLocked: "Complete consent first",
			completeBadge: "✓ Complete",
		},
		startButton: {
			title: "3. START EXPERIMENT",
			descriptionReady: "Begin setup & data collection",
			descriptionConsentNeeded: "Complete consent first",
			descriptionInfoNeeded: "Enter participant info first",
		},
		footer: {
			step1: "Step 1: Read the About section to learn more and provide consent",
			step2: "Step 2: Enter your participant information",
			step3: "Step 3: Click 'Start Experiment' to begin data collection",
		},
		manageSessionsButton: "Manage Sessions",
	},

	// Consent / About Dialog
	consent: {
		title: "Data Collection Consent",
		introduction:
			"This platform collects data for gaze estimation research. Please read the following information carefully before proceeding.",
		whatWeCollect: {
			heading: "What We Collect:",
			item1: "Webcam video recording of your face during gameplay",
			item2: "Screen recording of the game interface",
			item3: "Game statistics (time, moves, matches, clicks, etc.)",
		},
		howWeUseIt: {
			heading: "How We Use Your Data:",
			description:
				"The collected data will be used to train machine learning models for gaze estimation. This helps computers understand where people are looking on a screen based on facial features and eye movements.",
		},
		requirements: {
			heading: "Requirements:",
			item1: "A working webcam",
			item2: "Permission to access your webcam",
			item3: "Permission to record your screen",
			item4: "Fullscreen mode",
			item5: "Chrome browser",
		},
		consentStatement:
			"By clicking 'I Agree and Consent', you acknowledge that you have read and understood this information, and you agree to participate in this data collection.",
		agreeButton: "I Agree and Consent",
		closeButton: "Close",
	},

	// Participant Form
	participantForm: {
		title: "Participant Info",
		description: "Please provide the following information to begin the experiment",
		nameLabel: "Name",
		namePlaceholder: "Enter your name",
		nameError: "Name is required",
		ageLabel: "Age",
		agePlaceholder: "Enter your age",
		ageError: "Age is required",
		genderLabel: "Gender",
		genderPlaceholder: "Select gender",
		genderError: "Gender is required",
		genderOptions: {
			male: "Male",
			female: "Female",
			preferNotToSay: "Prefer not to say",
		},
		visionCorrectionLabel: "Vision Correction",
		wearingGlasses: "I am wearing glasses",
		wearingContacts: "I am wearing contact lenses",
		cancelButton: "Cancel",
		continueButton: "Continue",
	},

	// Setup Flow - Webcam Step
	webcamSetup: {
		title: "Webcam Preview",
		noWebcamMessage: "No webcam connected",
		errorTitle: "Webcam Error",
		importantLabel: "Important:",
		instruction1: "Please ensure your face is clearly visible",
		instruction2: "Position yourself at the center of the screen",
		instruction3: "Make sure you have adequate lighting",
		enableButton: "Enable Webcam",
		requestingAccess: "Requesting Access...",
		readyMessage: "Webcam is ready!",
		continueButton: "Continue to Calibration",
		cancelButton: "Cancel",
	},

	// Setup Flow - Screen Recording Step
	screenRecordingSetup: {
		description: "We need permission to record your screen during the experiment",
		whatHappensLabel: "What happens next:",
		instruction1: "Browser will ask which screen to share",
		instruction2: 'Please select "entire screen"',
		errorTitle: "Error",
		backButton: "Back",
		continueButton: "Get Screen Permission",
		gettingPermissions: "Getting Permissions...",
	},

	// Setup Flow - Fullscreen Step
	fullscreenSetup: {
		title: "Enter Fullscreen",
		description: "For accurate data collection, the experiment must run in fullscreen mode",
		whatHappensLabel: "What happens next:",
		instruction1: "Browser will enter fullscreen mode",
		instruction2: "Complete the calibration process",
		instruction3: "Then play a card pairing game",
		permissionsGrantedLabel: "Permissions granted:",
		permissionsGrantedMessage:
			"Preparations completed. Recording will start when you enter fullscreen.",
		errorTitle: "Error",
		backButton: "Back",
		continueButton: "Continue",
		startingRecording: "Starting Recording...",
	},

	// Setup Flow - Complete
	setupComplete: {
		title: "Setup Complete!",
		message: "Starting the game...",
	},

	// Calibration
	calibration: {
		introTitle: "Gaze Calibration",
		introDescription: "Before we begin, we need to calibrate the gaze tracking system.",
		instructionsLabel: "Instructions:",
		instruction1: "There will be 25 points to click on the screen",
		instruction2: "Keep your head still and only move your eyes",
		instruction3: "Focus your gaze on the point, click it, and keep staring until it moves",
		instruction4:
			"During click and stare, you are not allowed to blink. (You can blink before click)",
		startButton: "Start Calibration",
		completeTitle: "Calibration Complete!",
		completeMessage: "Calibration data collected successfully!",
		restartButton: "Restart Calibration",
		continueButton: "Continue",
		failedTitle: "Calibration Failed",
		failedMessage:
			"You exited fullscreen mode during calibration. The video recordings are now invalid and will be discarded.",
		failedWarning:
			"⚠️ Fullscreen must NOT be exited during the experiment, or you will need to start over.",
		abortButton: "Abort & Exit",
		pointLabel: {
			topLeft: "Top Left",
			topCenter: "Top Center",
			topRight: "Top Right",
			centerLeft: "Center Left",
			centerCenter: "Center",
			centerRight: "Center Right",
			bottomLeft: "Bottom Left",
			bottomCenter: "Bottom Center",
			bottomRight: "Bottom Right",
		},
	},

	// Game / Gameplay
	game: {
		navbar: {
			timeLabel: "Time",
			movesLabel: "Moves",
			matchesLabel: "Matches",
			nextSpiritLabel: "Next Spirit",
			restartButton: "Restart",
			restartConfirmTitle: "Confirm",
			restartConfirmMessage:
				"Are you sure you want to restart the experiment? This will stop the current recording and return to the main menu.",
		},
		winDialog: {
			title: "Game Complete!",
			message: "Congratulations! You found all the pairs!",
			matchesLabel: "💎 Matches:",
			movesLabel: "🎯 Moves:",
			timeLabel: "⏱️ Time:",
			uploadButton: "Upload Data",
			returnButton: "Return to Menu",
		},
		returnConfirmTitle: "Data Not Uploaded",
		returnConfirmMessage:
			"You haven't uploaded your data yet. Experiment is consider completed only when data is uploaded. Are you sure you want to continue?",
		returnConfirmYes: "Yes, Return to Menu",
		returnConfirmCancel: "Cancel",
	},

	// Dungeon Spirit Overlay
	dungeonSpirit: {
		appearMessage: "The Dungeon Spirit appears!",
		banishMessage: "Spirit banished!",
		clickLabel: "Click to banish the Dungeon Spirit",
	},

	// Recording Indicator
	recordingIndicator: {
		recording: "RECORDING",
		paused: "PAUSED",
	},

	// Fullscreen Monitor
	fullscreenMonitor: {
		title: "Fullscreen Mode Exited",
		message: "Data collection has been paused because fullscreen mode was exited.",
		description:
			"For accurate data collection, this application must remain in fullscreen mode. Please click the button below to return to fullscreen and resume.",
		returnButton: "Return to Fullscreen",
		keyboardHint: "Or press",
		keyboardKey: "F11",
		keyboardHintSuffix: "on your keyboard",
	},

	// Export Dialog
	exportDialog: {
		title: "Export Data",
		description: "Upload your recorded data",
		participantLabel: "Participant:",
		sessionIdLabel: "Session ID:",
		clicksRecordedLabel: "Clicks Recorded:",
		gameDurationLabel: "Game Duration:",
		uploadingLabel: "Uploading...",
		successTitle: "Success!",
		successMessage: "Upload successful!",
		errorTitle: "Error",
		uploadButton: "Upload to Server",
		uploadingButton: "Uploading...",
		downloadButton: "Download Locally (Dev Only)",
		closeButton: "Close",
	},

	// Session Manager / Cleanup Dialog
	sessionManager: {
		title: "Session Manager",
		description:
			"Manage stored recording sessions. Upload completed recordings or delete old data to free up disk space.",
		loadingMessage: "Loading sessions...",
		noSessionsTitle: "No Stored Sessions",
		noSessionsMessage: "You don't have any recording sessions yet.",
		sessionListTitle: "Stored Sessions",
		sessionListDescription: "Click on a session to view details or take action.",
		deleteButton: "Delete",
		uploadButton: "Upload",
		deletingButton: "Deleting...",
		uploadingButton: "Uploading...",
		uploadSuccessMessage: "Uploaded successfully!",
		errorTitle: "Error",
		statusBadge: {
			recording: "RECORDING",
			completed: "COMPLETED",
			uploaded: "UPLOADED",
			error: "ERROR",
		},
		statusDescription: {
			recording: "This session was interrupted (browser crash/refresh). Contains incomplete data.",
			completed: "Recording completed. Ready to upload.",
			completedIncomplete: "Recording completed but may be missing game data. Upload with caution.",
			uploaded: "Already uploaded to server. Safe to delete to free up space.",
			error: "An error occurred during recording. Contains incomplete data.",
		},
		deleteConfirm: "Are you sure you want to delete this session data?",
		uploadIncompleteWarning:
			"Warning: This session appears to be incomplete and may be missing game interaction data (clicks, moves, etc.). This can happen if the browser was closed before the game finished.\n\nDo you still want to upload it?",
		uploadProgress: "Uploading...",
		sizeLabel: "Size:",
		dateLabel: "Date:",
		participantLabel: "Participant:",
		clicksLabel: "Clicks:",
		movesLabel: "Moves:",
		matchesLabel: "Matches:",
		statusLabel: "Status:",
	},

	// Error Page
	errorPage: {
		title: "Error",
		resetButton: "Reset",
	},

	// Common Error Messages
	errors: {
		webcamPermissionDenied: "Webcam permission was denied. Please allow webcam access to continue.",
		webcamNotFound: "No webcam found. Please connect a webcam to continue.",
		webcamInUse: "Webcam is already in use by another application.",
		webcamGeneric: "Failed to access webcam",
		screenRecordingFailed: "Failed to prepare video streams",
		fullscreenFailed: "Failed to enter fullscreen or start recording.",
		recordingStopFailed: "Failed to stop recording:",
		calibrationFullscreenRequired:
			"Fullscreen is required for calibration. Please enter fullscreen again.",
		missingSessionData: "Missing required session data",
		uploadFailed: "Failed to upload data",
		downloadFailed: "Failed to download data",
		sessionLoadFailed: "Failed to load sessions",
		sessionDeleteFailed: "Failed to delete session",
		finalizeRecordingFailed: "Failed to finalize recording",
		returnToMenuFailed: "Failed to return to menu. Please try again.",
		restartExperimentFailed: "Failed to restart experiment. Please try again.",
		enableWebcamFirst: "Please enable your webcam before continuing",
	},
} as const

export const ZH_TW = {
	// Common UI elements
	common: {
		close: "關閉",
		cancel: "取消",
		continue: "繼續",
		back: "返回",
		confirm: "確認",
		ok: "確定",
		yes: "是",
		no: "否",
		error: "錯誤",
		success: "成功",
		loading: "載入中...",
		required: "*",
	},

	// Main Menu / Landing Page
	mainMenu: {
		title: "The Deep Vault",
		subtitle: "視線估測實驗平台",
		aboutButton: {
			title: "1. 關於",
			descriptionWithConsent: "查看數據收集資訊",
			descriptionNoConsent: "閱讀數據收集與同意事項",
			consentedBadge: "✓ 已同意",
		},
		participantButton: {
			title: "2. 參與者資訊",
			descriptionComplete: "點擊以編輯資訊",
			descriptionIncomplete: "輸入您的資訊",
			descriptionLocked: "請先完成同意事項",
			completeBadge: "✓ 已完成",
		},
		startButton: {
			title: "3. 開始實驗",
			descriptionReady: "開始設定與數據收集",
			descriptionConsentNeeded: "請先完成同意事項",
			descriptionInfoNeeded: "請先輸入參與者資訊",
		},
		footer: {
			step1: "步驟一：閱讀「關於」部分以了解本研究平台",
			step2: "步驟二：輸入您的資料",
			step3: "步驟三：點擊「開始實驗」以開始數據收集",
		},
		manageSessionsButton: "記錄管理",
	},

	// Consent / About Dialog
	consent: {
		title: "數據收集同意書",
		introduction: "本平台收集用於視線估測研究的數據。請仔細閱讀以下資訊。",
		whatWeCollect: {
			heading: "我們收集什麼：",
			item1: "遊戲過程中您臉部的 webcam 錄影",
			item2: "遊戲介面的螢幕錄影",
			item3: "遊戲統計資料（時間、移動次數、配對次數、點擊位置等）",
		},
		howWeUseIt: {
			heading: "我們如何使用您的數據：",
			description:
				"收集的數據將用於訓練視線估測的機器學習模型。這有助於電腦根據面部特徵和眼球運動來理解人們在螢幕上看的位置。",
		},
		requirements: {
			heading: "Requirements：",
			item1: "可正常運作的 webcam",
			item2: "存取 webcam 的權限",
			item3: "錄製螢幕的權限",
			item4: "全螢幕模式",
			item5: "Chrome 遊覽器",
		},
		consentStatement: "點擊「我同意」，即表示您已閱讀並理解此資訊，並同意參與此數據收集。",
		agreeButton: "我同意",
		closeButton: "關閉",
	},

	// Participant Form
	participantForm: {
		title: "參與者資訊",
		description: "請提供以下資訊",
		nameLabel: "姓名",
		namePlaceholder: "輸入您的姓名",
		nameError: "姓名為必填",
		ageLabel: "年齡",
		agePlaceholder: "輸入您的年齡",
		ageError: "年齡為必填",
		genderLabel: "性別",
		genderPlaceholder: "選擇性別",
		genderError: "性別為必填",
		genderOptions: {
			male: "男性",
			female: "女性",
			preferNotToSay: "不願透露",
		},
		visionCorrectionLabel: "視力矯正",
		wearingGlasses: "我戴著眼鏡",
		wearingContacts: "我戴著隱形眼鏡",
		cancelButton: "取消",
		continueButton: "繼續",
	},

	// Setup Flow - Webcam Step
	webcamSetup: {
		title: "Webcam Preview",
		noWebcamMessage: "找不到 webcam",
		errorTitle: "Webcam 異常",
		importantLabel: "重要事項：",
		instruction1: "請確保您的臉部清晰可見",
		instruction2: "將臉部置於螢幕中央",
		instruction3: "確保您有足夠的照明",
		enableButton: "啟用 webcam",
		requestingAccess: "正在請求存取權限...",
		readyMessage: "webcam 已就緒！",
		continueButton: "繼續前往校準",
		cancelButton: "取消",
	},

	// Setup Flow - Screen Recording Step
	screenRecordingSetup: {
		description: "我們需要在實驗期間錄製您的螢幕的權限",
		whatHappensLabel: "接下來：",
		instruction1: "瀏覽器將詢問要分享哪個螢幕",
		instruction2: "請選擇「整個螢幕」",
		errorTitle: "錯誤",
		backButton: "返回",
		continueButton: "取得螢幕權限",
		gettingPermissions: "正在取得權限...",
	},

	// Setup Flow - Fullscreen Step
	fullscreenSetup: {
		title: "進入全螢幕",
		description: "為了準確收集數據，實驗必須在全螢幕模式下進行",
		whatHappensLabel: "接下來：",
		instruction1: "瀏覽器將進入全螢幕模式",
		instruction2: "完成校準過程",
		instruction3: "然後玩個卡片配對遊戲",
		permissionsGrantedLabel: "權限已授予：",
		permissionsGrantedMessage: "準備就緒。進入全螢幕時將開始錄製。",
		errorTitle: "錯誤",
		backButton: "返回",
		continueButton: "繼續",
		startingRecording: "正在開始錄製...",
	},

	// Setup Flow - Complete
	setupComplete: {
		title: "設定完成！",
		message: "正在啟動遊戲...",
	},

	// Calibration
	calibration: {
		introTitle: "視線校準",
		introDescription: "在開始遊戲之前，我們需要校準視線追蹤系統。",
		instructionsLabel: "說明：",
		instruction1: "螢幕上會有 25 個點需要點擊",
		instruction2: "校準過程保持頭部不動，只移動眼睛",
		instruction3: "聚焦並點擊黃點，繼續聚焦直到黃點移動",
		instruction4: "點擊和聚焦過程請別眨眼（點擊前可以眨眼）",
		startButton: "開始校準",
		completeTitle: "校準完成！",
		completeMessage: "已成功搜集校準資料！",
		restartButton: "重新校準",
		continueButton: "繼續",
		failedTitle: "校準失敗",
		failedMessage: "您在校準期間退出了全螢幕模式。視訊錄製現在無效，將被刪除。",
		failedWarning: "⚠️ 實驗期間不得退出全螢幕，否則您將需要重新開始。",
		abortButton: "中止並退出",
		pointLabel: {
			topLeft: "Top Left",
			topCenter: "Top Center",
			topRight: "Top Right",
			centerLeft: "Center Left",
			centerCenter: "Center",
			centerRight: "Center Right",
			bottomLeft: "Bottom Left",
			bottomCenter: "Bottom Center",
			bottomRight: "Bottom Right",
		},
	},

	// Game / Gameplay
	game: {
		navbar: {
			timeLabel: "時間",
			movesLabel: "移動",
			matchesLabel: "配對",
			nextSpiritLabel: "下個幽靈",
			restartButton: "重新開始",
			restartConfirmTitle: "確認",
			restartConfirmMessage: "您確定要重新開始實驗嗎？這將停止當前錄製並返回首頁。",
		},
		winDialog: {
			title: "遊戲完成！",
			message: "恭喜！您找到了所有配對！",
			matchesLabel: "💎 配對：",
			movesLabel: "🎯 移動：",
			timeLabel: "⏱️ 時間：",
			uploadButton: "上傳數據",
			returnButton: "返回首頁",
		},
		returnConfirmTitle: "數據尚未上傳",
		returnConfirmMessage: "您尚未上傳數據。資料上傳後才算完成實驗。您確定要離開嗎？",
		returnConfirmYes: "確定",
		returnConfirmCancel: "取消",
	},

	// Dungeon Spirit Overlay
	dungeonSpirit: {
		appearMessage: "幽靈出現了！",
		banishMessage: "幽靈已被驅逐！",
		clickLabel: "點擊以驅逐幽靈",
	},

	// Recording Indicator
	recordingIndicator: {
		recording: "錄製中",
		paused: "已暫停",
	},

	// Fullscreen Monitor
	fullscreenMonitor: {
		title: "已退出全螢幕模式",
		message: "由於退出全螢幕模式，數據收集已暫停。",
		description: "為了準確收集數據，此應用程式必須保持全螢幕模式。請點擊下方按鈕返回全螢幕並繼續。",
		returnButton: "返回全螢幕",
		keyboardHint: "或按",
		keyboardKey: "F11",
		keyboardHintSuffix: "在您的鍵盤上",
	},

	// Export Dialog
	exportDialog: {
		title: "數據上傳",
		description: "上傳您的實驗數據",
		participantLabel: "參與者：",
		sessionIdLabel: "記錄 ID：",
		clicksRecordedLabel: "已記錄點擊：",
		gameDurationLabel: "實驗時長：",
		uploadingLabel: "上傳中...",
		successTitle: "成功！",
		successMessage: "上傳成功！",
		errorTitle: "錯誤",
		uploadButton: "上傳到伺服器",
		uploadingButton: "上傳中...",
		downloadButton: "本地下載（僅開發）",
		closeButton: "關閉",
	},

	// Session Manager / Cleanup Dialog
	sessionManager: {
		title: "記錄管理",
		description: "管理已儲存的錄製記錄。上傳已完成的錄製或刪除舊數據以釋放空間。",
		loadingMessage: "正在載入記錄...",
		noSessionsTitle: "沒有已儲存的記錄",
		noSessionsMessage: "您還沒有任何錄製記錄。",
		sessionListTitle: "已儲存的記錄",
		sessionListDescription: "點擊記錄以查看詳細資訊或採取行動。",
		deleteButton: "刪除",
		uploadButton: "上傳",
		deletingButton: "刪除中...",
		uploadingButton: "上傳中...",
		uploadSuccessMessage: "上傳成功！",
		errorTitle: "錯誤",
		statusBadge: {
			recording: "錄製中",
			completed: "已完成",
			uploaded: "已上傳",
			error: "錯誤",
		},
		statusDescription: {
			recording: "此記錄半途中斷，數據不完整。",
			completed: "錄製已完成。準備上傳。",
			completedIncomplete: "錄製已完成，但可能缺少遊戲數據。請謹慎上傳。",
			uploaded: "已上傳到伺服器。可以刪除以釋放空間。",
			error: "錄製期間發生錯誤。包含不完整的數據。",
		},
		deleteConfirm: "您確定要刪除此記錄嗎？",
		uploadIncompleteWarning:
			"警告：此記錄似乎不完整，可能缺少遊戲互動數據（點擊、移動等）。這可能是因為在遊戲完成前關閉了瀏覽器。\n\n您仍要上傳嗎？",
		uploadProgress: "上傳中...",
		sizeLabel: "大小：",
		dateLabel: "日期：",
		participantLabel: "參與者：",
		clicksLabel: "點擊：",
		movesLabel: "移動：",
		matchesLabel: "配對：",
		statusLabel: "狀態：",
	},

	// Error Page
	errorPage: {
		title: "錯誤",
		resetButton: "重置",
	},

	// Common Error Messages
	errors: {
		webcamPermissionDenied: "webcam 權限被拒絕。請允許 webcam 存取以繼續。",
		webcamNotFound: "找不到 webcam。請連接 webcam 以繼續。",
		webcamInUse: "webcam 已被其他應用程式站用。",
		webcamGeneric: "無法存取 webcam",
		screenRecordingFailed: "螢幕錄製失敗",
		fullscreenFailed: "無法進入全螢幕或開始錄製。",
		recordingStopFailed: "無法停止錄製：",
		calibrationFullscreenRequired: "校準需要全螢幕。請再次進入全螢幕。",
		missingSessionData: "缺少必要的記錄數據",
		uploadFailed: "無法上傳數據",
		downloadFailed: "無法下載數據",
		sessionLoadFailed: "無法載入記錄",
		sessionDeleteFailed: "無法刪除記錄",
		finalizeRecordingFailed: "無法完成錄製",
		returnToMenuFailed: "無法返回首頁。請重試。",
		restartExperimentFailed: "無法重新開始實驗。請重試。",
		enableWebcamFirst: "請先啟用您的 webcam 再繼續",
	},
} as const

export type Language = "EN" | "ZH-TW"

// Type for the translation object (EN or ZH_TW)
export type TranslationObject = typeof EN | typeof ZH_TW

// Define a more flexible type that allows any string values but maintains structure
export type LocalizationKeys = {
	[K in keyof typeof EN]: (typeof EN)[K] extends Record<string, unknown>
		? {
				[P in keyof (typeof EN)[K]]: (typeof EN)[K][P] extends Record<string, unknown>
					? {
							[Q in keyof (typeof EN)[K][P]]: string
						}
					: string
			}
		: string
}

export const LOCALES: Record<Language, LocalizationKeys> = {
	EN,
	"ZH-TW": ZH_TW,
}

// Helper type for nested key access
export type NestedKeyOf<ObjectType extends object> = {
	[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
		? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
		: `${Key}`
}[keyof ObjectType & (string | number)]

// Helper function to get nested translation
export function t(key: string, language: Language = "EN"): string {
	const locale = LOCALES[language]
	const keys = key.split(".")
	let value: unknown = locale

	for (const k of keys) {
		if (value && typeof value === "object" && k in value) {
			value = (value as Record<string, unknown>)[k]
		} else {
			console.warn(`Translation key not found: ${key}`)
			return key
		}
	}

	return typeof value === "string" ? value : key
}
