/**
 * Safely sanitizes user input strings to prevent XSS (Cross-Site Scripting).
 * Escapes HTML characters.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes nested fields in an object recursively.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "string") {
    return sanitizeInput(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === "object") {
    const sanitizedObj = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj as T;
  }
  
  return obj;
}
