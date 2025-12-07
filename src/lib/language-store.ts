import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Language } from "./localization"

interface LanguageState {
	language: Language
	hasSelectedLanguage: boolean
	isHydrated: boolean
	setLanguage: (lang: Language) => void
	setHydrated: (hydrated: boolean) => void
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: "EN",
			hasSelectedLanguage: false,
			isHydrated: false,
			setLanguage: (lang: Language) =>
				set({
					language: lang,
					hasSelectedLanguage: true,
				}),
			setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
		}),
		{
			name: "gaze-language-storage",
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.isHydrated = true
				}
			},
		},
	),
)
