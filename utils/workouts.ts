export function getNumberValue(input: string) {
	let value = 0;

	const time = parseTime(input.trim());

	if (time > 0) return { value: time, isTime: true };

	const numberValueMatch = input.trim().match(/\d+/g);

	if (numberValueMatch) {
		value = parseInt(numberValueMatch[0]);
	}

	return { value, isTime: false };
}

export function parseTime(time: string): number {
	// Split the string on ":" to handle the MM:SS format
	const parts = time.split(":");
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	// If we have 3 parts, then the first part is the minutes and the second part is the seconds
	if (parts.length === 3) {
		hours = parseInt(parts[0]!, 10);
		minutes = parseInt(parts[1]!, 10);
		seconds = parseInt(parts[2]!, 10);
	} else if (parts.length === 2) {
		minutes = parseInt(parts[0]!, 10);
		seconds = parseInt(parts[1]!, 10);
	} else {
		// Handle shorthand like "20m38s", "1h30m", or "45s"
		const shorthand = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);

		if (shorthand && (shorthand[1] || shorthand[2] || shorthand[3])) {
			hours = parseInt(shorthand[1] ?? "0", 10);
			minutes = parseInt(shorthand[2] ?? "0", 10);
			seconds = parseInt(shorthand[3] ?? "0", 10);
		} else if (time.includes("min")) {
			// If we only have one part, then we need to check if it contains "min" or "sec" to determine whether it's the minutes or seconds
			minutes = parseInt(time, 10);
		} else if (time.includes("sec")) {
			seconds = parseInt(time, 10);
		}
	}

	// Return the total number of seconds
	return hours * 60 * 60 + minutes * 60 + seconds;
}
