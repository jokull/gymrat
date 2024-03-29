const formatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
  style: "short",
});

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

export function formatTimeAgo(date: Date) {
  let duration = (date.valueOf() - new Date().valueOf()) / 1000;
  for (let i = 0; i <= DIVISIONS.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const division = DIVISIONS[i]!;
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.ceil(duration), division.name);
    }
    duration /= division.amount;
  }
  return "";
}
