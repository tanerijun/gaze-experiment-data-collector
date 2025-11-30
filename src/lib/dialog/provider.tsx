import { useState } from "react"
import {
	AlertDialogUI,
	ConfirmDialogUI,
	CustomDialogUI,
	DialogShell,
	SelectPromptDialogUI,
	TextPromptDialogUI,
} from "./components"
import type {
	AlertDialogConfig,
	ConfirmDialogConfig,
	CustomDialogConfig,
	SelectPromptDialogConfig,
	TextPromptDialogConfig,
} from "./store"
import { useDialogStore } from "./store"

/**
 * DialogProvider is the master component that renders the active dialog.
 * It should be placed once at the root of the application.
 * It listens to the global dialog store stack and renders all dialogs in it.
 */
export function DialogProvider() {
	const stack = useDialogStore((state) => state.stack)

	return (
		<>
			{stack.map((config) => {
				switch (config.type) {
					case "alert":
						return <AlertDialogRenderer key={config.id} {...config.props} />
					case "confirm":
						return <ConfirmDialogRenderer key={config.id} {...config.props} />
					case "textPrompt":
						return <TextPromptDialogRenderer key={config.id} {...config.props} />
					case "selectPrompt":
						return <SelectPromptDialogRenderer key={config.id} {...config.props} />
					case "custom":
						return <CustomDialogRenderer key={config.id} {...config.props} />
					default:
						return null
				}
			})}
		</>
	)
}

function AlertDialogRenderer(props: AlertDialogConfig) {
	// The native <dialog> element calls onClose when 'Escape' is pressed.
	// For an alert, this is the same as confirming.
	return (
		<DialogShell onClose={props.onConfirm}>
			<AlertDialogUI {...props} />
		</DialogShell>
	)
}

function ConfirmDialogRenderer(props: ConfirmDialogConfig) {
	// Pressing 'Escape' is equivalent to cancelling.
	return (
		<DialogShell onClose={props.onCancel}>
			<ConfirmDialogUI {...props} />
		</DialogShell>
	)
}

function TextPromptDialogRenderer(props: TextPromptDialogConfig) {
	const [value, setValue] = useState(props.defaultValue ?? "")

	const handleConfirm = () => {
		props.onConfirm(value.trim())
	}

	return (
		<DialogShell onClose={props.onCancel}>
			<TextPromptDialogUI {...props} value={value} setValue={setValue} onConfirm={handleConfirm} />
		</DialogShell>
	)
}

function SelectPromptDialogRenderer(props: SelectPromptDialogConfig) {
	const [selectedValues, setSelectedValues] = useState<string[]>(props.initialValues ?? [])

	const handleSelectionChange = (value: string, checked: boolean) => {
		const isMultiple = props.multiple ?? false
		if (isMultiple) {
			setSelectedValues((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)))
		} else {
			setSelectedValues(checked ? [value] : [])
		}
	}

	const handleConfirm = () => {
		props.onConfirm(selectedValues)
	}

	return (
		<DialogShell onClose={props.onCancel}>
			<SelectPromptDialogUI
				{...props}
				selectedValues={selectedValues}
				onSelectionChange={handleSelectionChange}
				onConfirm={handleConfirm}
			/>
		</DialogShell>
	)
}

function CustomDialogRenderer(props: CustomDialogConfig) {
	const close = useDialogStore((state) => state.close)

	return (
		<DialogShell onClose={close} size={props.size}>
			<CustomDialogUI
				header={props.header ? props.header({ closeDialog: close }) : undefined}
				body={props.body({ closeDialog: close })}
				footer={props.footer ? props.footer({ closeDialog: close }) : undefined}
			/>
		</DialogShell>
	)
}
