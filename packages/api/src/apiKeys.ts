import { v4 as uuidv4 } from "uuid";

export function generateApiKey() {
  return uuidv4();
}
