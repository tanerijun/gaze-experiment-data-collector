import type { QueryClient } from "@tanstack/react-query"
import {
	ClientOnly,
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router"
import { FullscreenButton } from "@/components/fullscreen-button"
import { DialogProvider } from "@/lib/dialog/provider"
import appCss from "../styles.css?url"

// import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
// import { TanStackDevtools } from "@tanstack/react-devtools"
// import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

interface MyRouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "The Deep Vault",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<ClientOnly>
					<FullscreenButton className="fixed top-2 right-2 z-20" />
					<DialogProvider />
				</ClientOnly>
				{/*<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						{
							name: "Tanstack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
					]}
				/>*/}
				<Scripts />
			</body>
		</html>
	)
}
