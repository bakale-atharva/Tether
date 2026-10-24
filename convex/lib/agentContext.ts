import type { ModelMessage } from "ai";

// Budget serialized UTF-8, including metadata, rather than message count alone.
// Leave room for instructions and output in models with a 32K context window.
export const CONTEXT_BYTES_MAX = 28_000;
const encoder = new TextEncoder();
const bytes = (value: ModelMessage[]) => encoder.encode(JSON.stringify(value)).byteLength;

export function boundedContext(recent: ModelMessage[], prompt: ModelMessage[]): ModelMessage[] {
  const exchanges: ModelMessage[][] = [];
  for (const message of recent) {
    if (message.role === "user") exchanges.push([message]);
    else exchanges.at(-1)?.push(message);
  }
  let result = prompt;
  for (let index = exchanges.length - 1; index >= 0; index--) {
    const candidate = [...exchanges[index], ...result];
    if (bytes(candidate) > CONTEXT_BYTES_MAX) break;
    result = candidate;
  }
  return result;
}
