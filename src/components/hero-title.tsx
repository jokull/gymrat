import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "framer-motion";

/**
 * Hero headline with an animated mesh gradient woven into the glyphs.
 *
 * The shader canvas sits behind a headline rendered as white text on a
 * page-colored block with mix-blend-darken: the block stays page-colored
 * (min of the two darks) while the white glyphs resolve to the shader.
 * The old static gradient SVG remains underneath as the fallback when
 * WebGL or JS is unavailable.
 */
export function HeroTitle() {
	const reducedMotion = useReducedMotion();

	return (
		<div className="relative my-8 md:-mx-24">
			<div
				className="absolute inset-px bg-cover bg-no-repeat"
				style={{
					backgroundImage: "url(/background.svg?1)",
					backgroundPosition: "50% 50%",
				}}
			/>
			<MeshGradient
				className="absolute inset-px"
				colors={["#9d174d", "#db2777", "#ec4899", "#ffd6ec"]}
				speed={reducedMotion ? 0 : 0.6}
				distortion={0.8}
				swirl={0.6}
			/>
			<h1 className="relative bg-[rgb(5,1,13)] text-center text-3xl font-black leading-tight text-white mix-blend-darken sm:text-4xl md:text-5xl">
				The Notepad for Gymrats
			</h1>
		</div>
	);
}
