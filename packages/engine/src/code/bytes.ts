const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const CRC8_POLYNOMIAL = 0x07;

export const crc8 = (bytes: Uint8Array) => {
  let crc = 0;
  bytes.forEach((byte) => {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x80 ? ((crc << 1) ^ CRC8_POLYNOMIAL) & 0xff : (crc << 1) & 0xff;
    }
  });
  return crc;
};

export const toBase64Url = (bytes: Uint8Array) => {
  let result = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const chunk =
      ((bytes[index] ?? 0) << 16) | ((bytes[index + 1] ?? 0) << 8) | (bytes[index + 2] ?? 0);
    const chars = Math.min(4, Math.ceil(((bytes.length - index) * 8) / 6));
    for (let char = 0; char < chars; char += 1) {
      result += ALPHABET[(chunk >> (18 - 6 * char)) & 0x3f];
    }
  }
  return result;
};

export const fromBase64Url = (text: string): Uint8Array | null => {
  if (text.length % 4 === 1) return null;
  const values: number[] = [];
  for (const char of text) {
    const value = ALPHABET.indexOf(char);
    if (value === -1) return null;
    values.push(value);
  }

  const bytes: number[] = [];
  for (let index = 0; index < values.length; index += 4) {
    const group = values.slice(index, index + 4);
    const chunk = group.reduce((sum, value, offset) => sum | (value << (18 - 6 * offset)), 0);
    const byteCount = group.length - 1;
    for (let byte = 0; byte < byteCount; byte += 1) bytes.push((chunk >> (16 - 8 * byte)) & 0xff);
  }
  return Uint8Array.from(bytes);
};

export const toHex2 = (value: number) => value.toString(16).padStart(2, "0");
