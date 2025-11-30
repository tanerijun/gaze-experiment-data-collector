import type { ReactNode } from "react"

export interface SelectOption {
	value: string
	label: string | ReactNode
}

export interface AlertDialogProps {
	title: string
	message: string
	confirmText?: string
}

export interface ConfirmDialogProps extends AlertDialogProps {
	cancelText?: string
}

export interface TextPromptDialogProps extends ConfirmDialogProps {
	placeholder?: string
	inputType?: "text" | "textarea"
	defaultValue?: string
}

export interface SelectPromptDialogProps extends ConfirmDialogProps {
	options: SelectOption[]
	multiple?: boolean
	initialValues?: string[]
}

export interface CustomDialogProps {
	size?: "small" | "medium" | "large" | "extra-large"
	header?: (params: { closeDialog: () => void }) => ReactNode
	body: (params: { closeDialog: () => void }) => ReactNode
	footer?: (params: { closeDialog: () => void }) => ReactNode
}
