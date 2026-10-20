// Shared client/server limits. Character counts use Unicode code points.
export const POST_MAX = 280;
export const BIO_MAX = 160;
export const IMAGE_MAX = 4;
export const IMAGE_BYTES_MAX = 5 * 1024 * 1024;
export const ALT_MAX = 1000;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
// Ancestor chains are walked one document at a time; past this depth a reply
// permalink offers a jump to the conversation start instead.
export const ANCESTOR_LIMIT = 50;

export function characterCount(text: string): number {
  return Array.from(text).length;
}

export function postProblem(body: string, imageCount: number): string | null {
  if (imageCount < 0 || imageCount > IMAGE_MAX) return "Attach up to four images.";
  if (characterCount(body.trim()) > POST_MAX) return "Keep your post to 280 characters.";
  if (body.trim().length === 0 && imageCount === 0) return "Write a message or add an image.";
  return null;
}

// Replies are text-only, so there is no image-only exception.
export function replyProblem(body: string): string | null {
  if (body.trim().length === 0) return "Write a reply.";
  if (characterCount(body.trim()) > POST_MAX) return "Keep your reply to 280 characters.";
  return null;
}

// A deleted message stays in its conversation as a placeholder only while it
// has replies beneath it; a deleted leaf disappears entirely.
export function isVisibleInConversation(post: { deleted: boolean; childCount?: number }): boolean {
  return !post.deleted || (post.childCount ?? 0) > 0;
}

export function bioProblem(bio: string): string | null {
  return characterCount(bio.trim()) > BIO_MAX ? "Keep your bio to 160 characters." : null;
}

export function imageProblem(type: string, size: number): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(type)) return "Choose a JPEG, PNG, or WebP image.";
  if (size <= 0) return "This image is empty. Choose another file.";
  if (size > IMAGE_BYTES_MAX) return "Each image must be 5 MB or smaller.";
  return null;
}

export function imageBytesMatch(type: string, bytes: Uint8Array): boolean {
  if (type === "image/jpeg") return isCompleteJpeg(bytes);
  if (type === "image/png") return isCompletePng(bytes);
  if (type === "image/webp") return isCompleteWebp(bytes);
  return false;
}

function isCompleteJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 &&
    bytes[bytes.length - 2] === 255 && bytes[bytes.length - 1] === 217;
}

function isCompletePng(bytes: Uint8Array): boolean {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < signature.length || !signature.every((value, i) => bytes[i] === value)) return false;
  let offset = signature.length;
  let chunkIndex = 0;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    const next = offset + 12 + length;
    if (next > bytes.length) return false;
    if (chunkIndex === 0 && (type !== "IHDR" || length !== 13)) return false;
    if (type === "IEND") return length === 0 && next === bytes.length;
    offset = next;
    chunkIndex += 1;
  }
  return false;
}

function isCompleteWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 20 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return false;
  if (readUint32LittleEndian(bytes, 4) !== bytes.length - 8) return false;
  let offset = 12;
  let hasImageChunk = false;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = readUint32LittleEndian(bytes, offset + 4);
    const paddedLength = length + (length % 2);
    const next = offset + 8 + paddedLength;
    if (next > bytes.length) return false;
    if (type === "VP8 " || type === "VP8L" || type === "VP8X") hasImageChunk = true;
    offset = next;
  }
  return hasImageChunk && offset === bytes.length;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] * 2 ** 24) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + (bytes[offset + 3] * 2 ** 24)) >>> 0;
}
