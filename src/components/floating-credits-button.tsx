import { useState } from "react";
import CreditsDialog from "./credits-dialog";

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	);
}

export default function FloatingCreditsButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<>
			{/* Floating Button */}
			<div className="fixed bottom-6 right-6 z-50">
				<button
					type="button"
					onClick={() => setIsDialogOpen(true)}
					className="relative w-16 h-16 rounded-lg shadow-2xl border-4 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group overflow-hidden bg-linear-to-br from-stone-800 to-stone-900 border-stone-700 hover:scale-110 hover:border-stone-600"
					aria-label="Show credits"
					title="Credits"
				>
					{/* Button glow effect */}
					<div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-amber-400" />

					{/* Button shine effect */}
					<div className="absolute inset-0 rounded-lg bg-linear-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					{/* Corner decorations - stone colored */}
					<div className="absolute top-0 left-0 w-1 h-1 bg-stone-500 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute top-0 right-0 w-1 h-1 bg-stone-500 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute bottom-0 left-0 w-1 h-1 bg-stone-500 opacity-0 group-hover:opacity-100 transition-opacity" />
					<div className="absolute bottom-0 right-0 w-1 h-1 bg-stone-500 opacity-0 group-hover:opacity-100 transition-opacity" />

					{/* Icon content */}
					<span className="relative z-10 w-8 h-8 text-stone-300">
						<InfoIcon />
					</span>
				</button>
			</div>

			{/* Credits Dialog */}
			<CreditsDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
		</>
	);
}
