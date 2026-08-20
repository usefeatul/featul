import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export class SecretCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretCryptoError";
  }
}

const KEY_ENV_NAME = "NOTRA_CREDENTIALS_ENCRYPTION_KEY";
const KEY_DERIVATION_CONTEXT = "notra-credentials";

function toBase64(input: Buffer): string {
  return input.toString("base64");
}

function fromBase64(input: string): Buffer {
  return Buffer.from(input, "base64");
}

const CIPHER_VERSION = "v1";
const IV_BYTES = 12;

export type SecretKeyVersion = string;
const ACTIVE_SECRET_KEY_VERSION = "v1";

function getEncryptionKey(keyVersion: SecretKeyVersion): Buffer {
  if (keyVersion !== ACTIVE_SECRET_KEY_VERSION) {
    throw new SecretCryptoError(`Unsupported key version: ${keyVersion}`);
  }
  const secret = String(process.env[KEY_ENV_NAME] || "").trim();
  if (!secret) {
    throw new SecretCryptoError(`Missing required env: ${KEY_ENV_NAME}`);
  }

  // Derive a stable purpose-specific key from the configured secret.
  return createHash("sha256")
    .update(KEY_DERIVATION_CONTEXT, "utf8")
    .update(":")
    .update(keyVersion, "utf8")
    .update(":")
    .update(secret, "utf8")
    .digest();
}

export function getSecretKeyVersion(): SecretKeyVersion {
  return ACTIVE_SECRET_KEY_VERSION;
}

export function hasSecretKeyVersion(version: string): boolean {
  return canEncryptSecrets() && version.trim() === ACTIVE_SECRET_KEY_VERSION;
}

export function encryptSecret(
  plainText: string,
  keyVersion: SecretKeyVersion = getSecretKeyVersion(),
): string {
  const normalizedVersion = keyVersion.trim();
  if (!normalizedVersion) {
    throw new SecretCryptoError("Missing key version for encryption");
  }

  const key = getEncryptionKey(normalizedVersion);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${CIPHER_VERSION}:${toBase64(iv)}:${toBase64(authTag)}:${toBase64(ciphertext)}`;
}

export function decryptSecret(
  payload: string,
  keyVersion: SecretKeyVersion = getSecretKeyVersion(),
): string {
  const normalizedVersion = keyVersion.trim();
  if (!normalizedVersion) {
    throw new SecretCryptoError("Missing key version for decryption");
  }

  const [version, ivBase64, tagBase64, ciphertextBase64] = String(
    payload || "",
  ).split(":");
  if (
    version !== CIPHER_VERSION ||
    !ivBase64 ||
    !tagBase64 ||
    !ciphertextBase64
  ) {
    throw new SecretCryptoError("Invalid encrypted payload format");
  }
  const key = getEncryptionKey(normalizedVersion);
  const iv = fromBase64(ivBase64);
  const authTag = fromBase64(tagBase64);
  const ciphertext = fromBase64(ciphertextBase64);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}

export function canEncryptSecrets(): boolean {
  return String(process.env[KEY_ENV_NAME] || "").trim().length > 0;
}
