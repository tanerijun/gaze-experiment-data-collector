import { useDialogStore } from "./store"
import type {
	AlertDialogProps,
	ConfirmDialogProps,
	CustomDialogProps,
	SelectPromptDialogProps,
	TextPromptDialogProps,
} from "./types"

export function useAlertDialog() {
	const { showAlert, close } = useDialogStore()
	return {
		alert: (config: AlertDialogProps): Promise<void> => {
			return new Promise((resolve) => {
				showAlert({
					...config,
					onConfirm: () => {
						close()
						resolve()
					},
				})
			})
		},
	}
}

export function useConfirmDialog() {
	const { showConfirm, close } = useDialogStore()
	return {
		confirm: (config: ConfirmDialogProps): Promise<boolean> => {
			return new Promise((resolve) => {
				showConfirm({
					...config,
					onConfirm: () => {
						close()
						resolve(true)
					},
					onCancel: () => {
						close()
						resolve(false)
					},
				})
			})
		},
	}
}

export function useTextPromptDialog() {
	const { showTextPrompt, close } = useDialogStore()
	return {
		prompt: (config: TextPromptDialogProps): Promise<string | null> => {
			return new Promise((resolve) => {
				showTextPrompt({
					...config,
					onConfirm: (value) => {
						close()
						resolve(value)
					},
					onCancel: () => {
						close()
						resolve(null)
					},
				})
			})
		},
	}
}

export function useSelectPromptDialog() {
	const { showSelectPrompt, close } = useDialogStore()
	return {
		select: (config: SelectPromptDialogProps): Promise<string[] | null> => {
			return new Promise((resolve) => {
				showSelectPrompt({
					...config,
					onConfirm: (values) => {
						close()
						resolve(values)
					},
					onCancel: () => {
						close()
						resolve(null)
					},
				})
			})
		},
	}
}

export function useCustomDialog() {
	const { showCustom, close, closeAll } = useDialogStore()
	return {
		show: (config: CustomDialogProps): void => {
			showCustom(config)
		},
		close,
		closeAll,
	}
}
