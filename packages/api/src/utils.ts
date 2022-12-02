export function getNumberValue(value: string) {
  let numberValue = 0;

  const numberValueMatch = value.trim().match(/\d+/g);

  if (numberValueMatch) {
    numberValue = parseInt(numberValueMatch[0]);
  }

  return numberValue;
}
