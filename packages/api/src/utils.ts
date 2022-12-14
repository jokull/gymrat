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
    const [part1, part2, part3] = parts as [string, string, string];
    hours = parseInt(part1, 10);
    minutes = parseInt(part2, 10);
    seconds = parseInt(part3, 10);
  }
  // If we have 2 parts, then the first part is the minutes and the second part is the seconds
  else if (parts.length === 2) {
    const [part1, part2] = parts as [string, string];
    minutes = parseInt(part1, 10);
    seconds = parseInt(part2, 10);
  } else {
    // If we only have one part, then we need to check if it contains "min" or "sec" to determine whether it's the minutes or seconds
    if (time.includes("min")) {
      minutes = parseInt(time, 10);
    } else if (time.includes("sec")) {
      seconds = parseInt(time, 10);
    }
  }

  // Return the total number of seconds
  return hours * 60 * 60 + minutes * 60 + seconds;
}
