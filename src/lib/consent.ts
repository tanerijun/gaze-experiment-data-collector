import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ConsentState {
	hasConsented: boolean
	consentTimestamp: string | null
	setConsent: (consented: boolean) => void
	clearConsent: () => void
}

export const useConsentStore = create<ConsentState>()(
	persist(
		(set) => ({
			hasConsented: false,
			consentTimestamp: null,
			setConsent: (consented: boolean) =>
				set({
					hasConsented: consented,
					consentTimestamp: consented ? new Date().toISOString() : null,
				}),
			clearConsent: () =>
				set({
					hasConsented: false,
					consentTimestamp: null,
				}),
		}),
		{
			name: "gaze-consent-storage",
		},
	),
)

export const CONSENT_TEXT = {
	title: "Data Collection Consent",
	introduction:
		"This platform collects data for gaze estimation research. Please read the following information carefully before proceeding.",
	whatWeCollect: {
		heading: "What We Collect:",
		items: [
			"Webcam video recording of your face during gameplay",
			"Screen recording of the game interface",
			"Click events with timestamps and positions",
			"Game statistics (time, moves, matches)",
		],
	},
	howWeUseIt: {
		heading: "How We Use Your Data:",
		description:
			"The collected data will be used to train machine learning models for gaze estimation. This helps computers understand where people are looking on a screen based on facial features and eye movements.",
	},
	privacy: {
		heading: "Privacy & Data Handling:",
		items: [
			"All recordings are processed locally in your browser",
			"Data is only saved when you explicitly download/export it",
			"No data is automatically uploaded to any server",
			"You can review recordings before exporting",
			"You can stop and delete recordings at any time",
		],
	},
	rights: {
		heading: "Your Rights:",
		items: [
			"Participation is completely voluntary",
			"You can withdraw consent at any time",
			"You can choose not to export collected data",
			"Webcam and screen permissions can be revoked through your browser",
		],
	},
	requirements: {
		heading: "Technical Requirements:",
		items: [
			"A working webcam",
			"Permission to access your webcam",
			"Permission to record your screen",
			"Fullscreen mode (required for accurate click position tracking)",
			"Modern browser (Chrome, Firefox, or Edge recommended)",
		],
	},
	consentStatement:
		"By clicking 'I Agree and Consent', you acknowledge that you have read and understood this information, and you voluntarily agree to participate in this data collection.",
}
