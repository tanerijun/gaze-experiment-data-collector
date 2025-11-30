import { create } from "zustand"
import type {
	AlertDialogProps,
	ConfirmDialogProps,
	CustomDialogProps,
	SelectPromptDialogProps,
	TextPromptDialogProps,
} from "./types"

export interface AlertDialogConfig extends AlertDialogProps {
	onConfirm: () => void
}

export interface ConfirmDialogConfig extends ConfirmDialogProps {
	onConfirm: () => void
	onCancel: () => void
}

export interface TextPromptDialogConfig extends TextPromptDialogProps {
	onConfirm: (value: string) => void
	onCancel: () => void
}

export interface SelectPromptDialogConfig extends SelectPromptDialogProps {
	onConfirm: (values: string[]) => void
	onCancel: () => void
}

export interface CustomDialogConfig extends CustomDialogProps {}

export type DialogConfig =
	| { id: number; type: "alert"; props: AlertDialogConfig }
	| { id: number; type: "confirm"; props: ConfirmDialogConfig }
	| { id: number; type: "textPrompt"; props: TextPromptDialogConfig }
	| { id: number; type: "selectPrompt"; props: SelectPromptDialogConfig }
	| { id: number; type: "custom"; props: CustomDialogConfig }

interface DialogStore {
	stack: DialogConfig[]

	showAlert: (config: AlertDialogConfig) => void
	showConfirm: (config: ConfirmDialogConfig) => void
	showTextPrompt: (config: TextPromptDialogConfig) => void
	showSelectPrompt: (config: SelectPromptDialogConfig) => void
	showCustom: (config: CustomDialogConfig) => void

	close: () => void
	closeAll: () => void
}

let dialogId = 0

export const useDialogStore = create<DialogStore>((set) => ({
	stack: [],

	showAlert: (config) =>
		set((state) => ({
			stack: [...state.stack, { id: dialogId++, type: "alert", props: config }],
		})),
	showConfirm: (config) =>
		set((state) => ({
			stack: [...state.stack, { id: dialogId++, type: "confirm", props: config }],
		})),
	showTextPrompt: (config) =>
		set((state) => ({
			stack: [...state.stack, { id: dialogId++, type: "textPrompt", props: config }],
		})),
	showSelectPrompt: (config) =>
		set((state) => ({
			stack: [...state.stack, { id: dialogId++, type: "selectPrompt", props: config }],
		})),
	showCustom: (config) =>
		set((state) => ({
			stack: [...state.stack, { id: dialogId++, type: "custom", props: config }],
		})),

	close: () =>
		set((state) => ({
			stack: state.stack.slice(0, -1),
		})),

	closeAll: () =>
		set(() => ({
			stack: [],
		})),
}))
