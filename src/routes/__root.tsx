import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "~/src/globals.css?url";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1",
			},
			{ title: "Gymrat" },
			{ name: "description", content: "The simple workout tracker" },
			{ property: "og:title", content: "Gymrat" },
			{ property: "og:description", content: "The simple workout tracker" },
			{ property: "og:image", content: "https://www.gymrat.is/opengraph-image.png" },
		],
		links: [
			{ rel: "icon", href: "/favicon.ico", sizes: "32x32" },
			{ rel: "apple-touch-icon", href: "/apple-icon.png" },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-[rgb(5,1,13)] px-4">
				<div className="mx-auto h-full max-w-lg py-4 text-white sm:py-8">{children}</div>
				<Scripts />
			</body>
		</html>
	);
}
