import { type ComponentType, useState } from "react"
import { cn } from "@/lib/utils"

interface DialogButtonProps {
	className?: string
	icon: React.ReactNode
	label: string
	title: string
	dialog: ComponentType<{ isOpen: boolean; onClose: () => void }>
}

export function DialogButton({
	className,
	icon,
	label,
	title,
	dialog: DialogComponent,
}: DialogButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	return (
		<>
			{/* Dialog Trigger */}
			<div className={cn(className)}>
				<button
					type="button"
					onClick={() => setIsDialogOpen(true)}
					className="relative w-16 h-16 rounded-lg shadow-2xl border-4 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group overflow-hidden bg-linear-to-br from-stone-800 to-stone-900 border-stone-700 hover:scale-110 hover:border-stone-600"
					aria-label={label}
					title={title}
				>
					{/* Button glow effect */}
					<div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-amber-400" />

					{/* Button shine effect */}
					<div className="absolute inset-0 rounded-lg bg-linear-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					{/* Corner decorations */}
					<div className="absolute top-0 left-0 w-1 h-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute top-0 right-0 w-1 h-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute bottom-0 left-0 w-1 h-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute bottom-0 right-0 w-1 h-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />

					{/* Icon content */}
					<div className="flex items-center justify-center z-10 text-amber-400 group-hover:text-amber-300 transition-colors">
						{icon}
					</div>
				</button>
			</div>

			{/* Dialog */}
			<DialogComponent isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
		</>
	)
}
