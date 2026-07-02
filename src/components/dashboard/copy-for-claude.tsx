import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { $getClaudePrompt } from "~/src/lib/workouts";

/**
 * Copies an agent-ready prompt (data dictionary + signed 24h CSV link)
 * to the clipboard. The prompt is prefetched so the clipboard write can
 * happen synchronously inside the click gesture (Safari requirement).
 */
export function CopyForClaude() {
	const { data: prompt } = useQuery({
		queryKey: ["claude-prompt"],
		queryFn: ({ signal }) => $getClaudePrompt({ signal }),
		staleTime: 60 * 60 * 1000,
		retry: false,
	});
	const [copied, setCopied] = useState(false);

	if (!prompt) return null;

	return (
		<button
			type="button"
			className="cursor-pointer underline"
			onClick={() => {
				void navigator.clipboard.writeText(prompt);
				setCopied(true);
				window.setTimeout(() => {
					setCopied(false);
				}, 2000);
			}}
		>
			{copied ? "Copied!" : "Copy for Claude"}
		</button>
	);
}
