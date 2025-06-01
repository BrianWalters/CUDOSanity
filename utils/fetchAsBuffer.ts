import { Buffer } from "node:buffer";

export async function fetchAsBuffer(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}.`);
  }

  return Buffer.from(await response.arrayBuffer());
}
