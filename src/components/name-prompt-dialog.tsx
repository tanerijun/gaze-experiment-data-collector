import { useEffect, useId, useRef, useState } from "react"
import { CloseIcon } from "./icons"

interface NamePromptDialogProps {
	isOpen: boolean
	onSubmit: (name: string) => void
	onCancel: () => void
}

export default function NamePromptDialog({ isOpen, onSubmit, onCancel }: NamePromptDialogProps) {
	const [name, setName] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const titleId = useId()

	useEffect(() => {
		if (isOpen) {
			setName("")
			// Focus input after dialog opens
			setTimeout(() => inputRef.current?.focus(), 50)
		}
	}, [isOpen])

	const handleSubmit = () => {
		const trimmedName = name.trim()
		if (trimmedName.length > 0 && trimmedName.length <= 20 && isASCII(trimmedName)) {
			onSubmit(trimmedName)
			setName("")
		}
	}

	const isASCII = (str: string): boolean => {
		return /^[\x20-\x7E]*$/.test(str)
	}

	const handleCancel = () => {
		setName("")
		onCancel()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSubmit()
		} else if (e.key === "Escape") {
			handleCancel()
		}
	}

	if (!isOpen) return null

	return (
		<button
			type="button"
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={handleCancel}
			aria-label="Close dialog"
		>
			<div
				className="bg-linear-to-br from-amber-950 via-amber-900 to-yellow-950 rounded-xl shadow-2xl border-4 border-yellow-700 p-8 max-w-md w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-yellow-400 to-transparent rounded-t-lg" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-yellow-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-yellow-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-yellow-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-yellow-400" />

				{/* Close button */}
				<button
					type="button"
					onClick={handleCancel}
					className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-amber-800 hover:bg-amber-700 border-2 border-yellow-600 hover:border-yellow-500 transition-all duration-200 text-yellow-300 hover:text-yellow-100 cursor-pointer"
					aria-label="Close"
				>
					<CloseIcon className="size-6" />
				</button>

				{/* Content */}
				<h2 id={titleId} className="text-3xl font-bold text-yellow-100 mb-4 drop-shadow-lg">
					High Score!
				</h2>
				<p className="text-yellow-200 mb-6">Etch your name in history:</p>

				{/* Input field */}
				<input
					ref={inputRef}
					type="text"
					value={name}
					onChange={(e) => {
						const value = e.target.value
						if (isASCII(value) && value.length <= 20) {
							setName(value)
						}
					}}
					onKeyDown={(e) => {
						// Prevent any default space behavior
						if (e.key === " " && name.length >= 20) {
							e.preventDefault()
							return
						}
						handleKeyDown(e)
					}}
					placeholder="Your name..."
					className="w-full px-4 py-3 mb-6 bg-amber-950/60 border-2 border-yellow-600 rounded-lg text-yellow-100 placeholder-yellow-700/60 focus:outline-none focus:border-yellow-400 focus:bg-amber-950/80 transition-all duration-200"
					autoComplete="off"
				/>

				{/* Buttons */}
				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleCancel}
						className="flex-1 group relative overflow-hidden py-3 px-4 bg-linear-to-br from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-100 font-bold rounded-lg shadow-lg border-2 border-stone-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
					>
						{/* Button shine effect */}
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

						{/* Top border accent */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-stone-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10">Cancel</span>
					</button>

					<button
						type="button"
						onClick={handleSubmit}
						disabled={name.trim().length === 0 || name.length > 20}
						className="flex-1 group relative overflow-hidden py-3 px-4 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 disabled:border-gray-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
					>
						{/* Button shine effect */}
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

						{/* Top border accent */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10">Submit</span>
					</button>
				</div>

				{/* Bottom border accent */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-yellow-400 to-transparent rounded-b-lg" />
			</div>
		</button>
	)
}
