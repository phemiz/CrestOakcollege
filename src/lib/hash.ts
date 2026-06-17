import { argon2id, argon2Verify } from "hash-wasm";
import crypto from "crypto";

/**
 * Hashes a password using Argon2id (WebAssembly-backed).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await argon2id({
    password,
    salt,
    iterations: 3,
    memorySize: 4096, // 4MB
    parallelism: 1,
    hashLength: 32,
    outputType: "encoded",
  });
  return hash;
}

/**
 * Verifies a password against an Argon2id encoded hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2Verify({
      password,
      hash,
    });
  } catch (error) {
    console.error("Argon2 Verification Error:", error);
    return false;
  }
}
