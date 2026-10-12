import { type RefObject, useEffect } from "react";

/**
 * Lifts a bottom-pinned element above the software keyboard. iOS Safari lays the
 * keyboard over the page without resizing it, so the gap between the layout and
 * the visual viewport is how far a fixed element has to move.
 */
export function useKeyboardInset(ref: RefObject<HTMLElement | null>, enabled = true) {
	useEffect(() => {
		const viewport = window.visualViewport;
		if (!viewport || !enabled) return;
		const update = () => {
			const inset = Math.max(
				0,
				document.documentElement.clientHeight - viewport.height - viewport.offsetTop,
			);
			if (ref.current) ref.current.style.transform = `translateY(-${inset}px)`;
		};
		update();
		viewport.addEventListener("resize", update);
		viewport.addEventListener("scroll", update);
		return () => {
			viewport.removeEventListener("resize", update);
			viewport.removeEventListener("scroll", update);
		};
	}, [ref, enabled]);
}
