import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { CloseIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import type {
	AlertDialogProps,
	ConfirmDialogProps,
	SelectPromptDialogProps,
	TextPromptDialogProps,
} from "./types"

interface DialogShellProps {
	children: ReactNode
	onClose: () => void
	size?: "small" | "medium" | "large" | "extra-large"
}

export function DialogShell({ children, onClose, size = "small" }: DialogShellProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (dialog && !dialog.open) {
			dialog.showModal()
		}

		const handleClickOutside = (e: MouseEvent) => {
			if (dialog && e.target === dialog) {
				e.preventDefault()
				onClose()
			}
		}

		const handleCancel = (e: Event) => {
			e.preventDefault()
			onClose()
		}

		dialog?.addEventListener("click", handleClickOutside)
		dialog?.addEventListener("cancel", handleCancel)

		return () => {
			dialog?.removeEventListener("click", handleClickOutside)
			dialog?.removeEventListener("cancel", handleCancel)
			if (dialog?.open) {
				dialog.close()
			}
		}
	}, [onClose])

	return (
		<dialog
			ref={dialogRef}
			className="backdrop:bg-black/70 backdrop:backdrop-blur-sm bg-transparent h-full flex items-center justify-center p-0 max-w-none w-auto"
			style={{
				animation: "fadeIn 0.2s ease-in",
			}}
		>
			<div
				className={cn(
					"relative bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-stone-700 overflow-hidden w-full",
					{
						"max-w-md": size === "small",
						"max-w-xl": size === "medium",
						"max-w-3xl": size === "large",
						"max-w-5xl": size === "extra-large",
					},
				)}
				style={{
					animation: "zoomIn 0.2s ease-out",
				}}
			>
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-stone-600" />
				<div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-stone-600" />
				<div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-stone-600" />
				<div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-stone-600" />

				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all duration-200 text-stone-300 hover:text-stone-100 cursor-pointer z-10"
					aria-label="Close dialog"
				>
					<CloseIcon className="size-6" />
				</button>

				{children}

				{/* Bottom border accent */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
			</div>
		</dialog>
	)
}

const DialogHeader = ({ children }: { children: ReactNode }) => (
	<header className="relative p-6 pb-4 border-b-2 border-stone-700">{children}</header>
)

const DialogBody = ({ children }: { children: ReactNode }) => (
	<div className="relative p-6">{children}</div>
)

const DialogFooter = ({ children }: { children: ReactNode }) => (
	<footer className="relative p-6 pt-4 border-t-2 border-stone-700">{children}</footer>
)

// --- UI for each specific dialog type ---

interface AlertDialogUIProps extends AlertDialogProps {
	onConfirm: () => void
}

export function AlertDialogUI({ title, message, confirmText, onConfirm }: AlertDialogUIProps) {
	return (
		<>
			<DialogHeader>
				<h2 className="text-2xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
					{title}
				</h2>
			</DialogHeader>
			<DialogBody>
				<p className="text-center text-stone-200 text-lg">{message}</p>
			</DialogBody>
			<DialogFooter>
				<div className="flex justify-end">
					<button
						type="button"
						onClick={onConfirm}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						{/* Button shine effect */}
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{confirmText ?? "OK"}</span>
					</button>
				</div>
			</DialogFooter>
		</>
	)
}

interface ConfirmDialogUIProps extends ConfirmDialogProps {
	onConfirm: () => void
	onCancel: () => void
}

export function ConfirmDialogUI({
	title,
	message,
	confirmText,
	cancelText,
	onConfirm,
	onCancel,
}: ConfirmDialogUIProps) {
	return (
		<>
			<DialogHeader>
				<h2 className="text-2xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
					{title}
				</h2>
			</DialogHeader>
			<DialogBody>
				<p className="text-center text-stone-200 text-lg">{message}</p>
			</DialogBody>
			<DialogFooter>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-100 font-bold rounded-lg shadow-lg border-2 border-stone-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{cancelText ?? "Cancel"}</span>
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{confirmText ?? "Confirm"}</span>
					</button>
				</div>
			</DialogFooter>
		</>
	)
}

interface TextPromptDialogUIProps extends TextPromptDialogProps {
	value: string
	setValue: (v: string) => void
	onConfirm: () => void
	onCancel: () => void
}

export function TextPromptDialogUI({
	title,
	message,
	placeholder,
	inputType,
	confirmText,
	cancelText,
	value,
	setValue,
	onConfirm,
	onCancel,
}: TextPromptDialogUIProps) {
	return (
		<>
			<DialogHeader>
				<h2 className="text-2xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
					{title}
				</h2>
			</DialogHeader>
			<DialogBody>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						onConfirm()
					}}
					className="flex flex-col gap-4"
				>
					<p className="text-stone-200 text-lg">{message}</p>
					{inputType === "textarea" ? (
						<textarea
							className="w-full px-4 py-3 bg-stone-950/60 border-2 border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:bg-stone-950/80 transition-all duration-200 resize-none"
							placeholder={placeholder}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							rows={3}
						/>
					) : (
						<input
							type="text"
							className="w-full px-4 py-3 bg-stone-950/60 border-2 border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:bg-stone-950/80 transition-all duration-200"
							placeholder={placeholder}
							value={value}
							onChange={(e) => setValue(e.target.value)}
						/>
					)}
				</form>
			</DialogBody>
			<DialogFooter>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-100 font-bold rounded-lg shadow-lg border-2 border-stone-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{cancelText ?? "Cancel"}</span>
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{confirmText ?? "Confirm"}</span>
					</button>
				</div>
			</DialogFooter>
		</>
	)
}

interface SelectPromptDialogUIProps extends SelectPromptDialogProps {
	selectedValues: string[]
	onSelectionChange: (v: string, c: boolean) => void
	onConfirm: () => void
	onCancel: () => void
}

export function SelectPromptDialogUI({
	title,
	message,
	options,
	multiple,
	confirmText,
	cancelText,
	selectedValues,
	onSelectionChange,
	onConfirm,
	onCancel,
}: SelectPromptDialogUIProps) {
	return (
		<>
			<DialogHeader>
				<h2 className="text-2xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
					{title}
				</h2>
			</DialogHeader>
			<DialogBody>
				<div className="flex flex-col gap-4">
					<p className="text-stone-200 text-lg">{message}</p>
					<div className="flex max-h-60 flex-col gap-3 overflow-y-auto p-1">
						{options.map((option) => {
							const isChecked = selectedValues.includes(option.value)
							return (
								<label
									key={option.value}
									className="flex cursor-pointer items-center gap-3 p-3 rounded-lg hover:bg-stone-700/30 transition-colors duration-200"
								>
									<input
										type={multiple ? "checkbox" : "radio"}
										name={multiple ? undefined : "select-option"}
										className="w-5 h-5 text-amber-500 bg-stone-950 border-stone-600 rounded focus:ring-2 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
										checked={isChecked}
										onChange={(e) => onSelectionChange(option.value, e.target.checked)}
									/>
									<div className="flex items-center gap-2 text-stone-200">{option.label}</div>
								</label>
							)
						})}
					</div>
				</div>
			</DialogBody>
			<DialogFooter>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-100 font-bold rounded-lg shadow-lg border-2 border-stone-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{cancelText ?? "Cancel"}</span>
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<span className="relative z-10">{confirmText ?? "Confirm"}</span>
					</button>
				</div>
			</DialogFooter>
		</>
	)
}

interface CustomDialogUIProps {
	header?: ReactNode
	body: ReactNode
	footer?: ReactNode
}

export function CustomDialogUI({ header, body, footer }: CustomDialogUIProps) {
	return (
		<>
			{header && <DialogHeader>{header}</DialogHeader>}
			<DialogBody>{body}</DialogBody>
			{footer && <DialogFooter>{footer}</DialogFooter>}
		</>
	)
}
