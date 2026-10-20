// Shared client/server limits. Character counts use Unicode code points.
export const POST_MAX = 280;
export const BIO_MAX = 160;
export const IMAGE_MAX = 4;
export const IMAGE_BYTES_MAX = 5 * 1024 * 1024;
export const ALT_MAX = 1000;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function characterCount(text: string): number {
  return Array.from(text).length;
}

export function postProblem(body: string, imageCount: number): string | null {
  if (imageCount < 0 || imageCount > IMAGE_MAX) return "Attach up to four images.";
  if (characterCount(body.trim()) > POST_MAX) return "Keep your post to 280 characters.";
  if (body.trim().length === 0 && imageCount === 0) return "Write a message or add an image.";
  return null;
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
  if (type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/png") {
    return [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
  }
  if (type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}
