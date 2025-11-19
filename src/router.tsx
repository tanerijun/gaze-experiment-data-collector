import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

function getRQContext() {
	const queryClient = new QueryClient();
	return {
		queryClient,
	};
}

function RQProvider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export const getRouter = () => {
	const rqContext = getRQContext();

	const router = createRouter({
		routeTree,
		context: { ...rqContext },
		defaultPreload: "intent",
		Wrap: (props: { children: React.ReactNode }) => {
			return <RQProvider {...rqContext}>{props.children}</RQProvider>;
		},
	});

	setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

	return router;
};
