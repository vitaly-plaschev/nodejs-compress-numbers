import { Buffer } from "buffer";

// Compress array of numbers (1-300) to Base64 string
function compressNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    throw new Error("Input must be an array");
  }

  const n = numbers.length;
  if (n === 0) return "";

  // Calculate buffer size: 4 bytes (array length) + packed numbers
  const totalBits = n * 9;
  const totalBytes = 4 + Math.ceil(totalBits / 8);
  const buffer = Buffer.alloc(totalBytes);

  // Write array length (4 bytes)
  buffer.writeUInt32BE(n, 0);

  let bitBuffer = 0;
  let bitCount = 0;
  let byteIndex = 4;

  for (const num of numbers) {
    if (!Number.isInteger(num) || num < 1 || num > 300) {
      throw new Error(`Number ${num} is out of range (1-300)`);
    }

    // Convert to 0-299 range (9 bits)
    const value = num - 1;
    bitBuffer = (bitBuffer << 9) | value;
    bitCount += 9;

    // Write full bytes when we have at least 8 bits
    while (bitCount >= 8) {
      const byte = (bitBuffer >>> (bitCount - 8)) & 0xff;
      buffer.writeUInt8(byte, byteIndex++);
      bitCount -= 8;
    }
  }

  // Write remaining bits
  if (bitCount > 0) {
    const byte = (bitBuffer << (8 - bitCount)) & 0xff;
    buffer.writeUInt8(byte, byteIndex);
  }

  return buffer.toString("base64");
}

// Decompress Base64 string to array of numbers
function decompressNumbers(compressed) {
  if (compressed === "") return [];

  const buffer = Buffer.from(compressed, "base64");
  const n = buffer.readUInt32BE(0);
  const result = new Array(n);

  let bitBuffer = 0;
  let bitCount = 0;
  let byteIndex = 4;
  let numIndex = 0;

  while (numIndex < n) {
    // Read more bytes until we have at least 9 bits
    while (bitCount < 9 && byteIndex < buffer.length) {
      const byte = buffer.readUInt8(byteIndex++);
      bitBuffer = (bitBuffer << 8) | byte;
      bitCount += 8;
    }

    if (bitCount < 9) {
      throw new Error("Unexpected end of data");
    }

    // Extract next 9-bit number
    const value = (bitBuffer >>> (bitCount - 9)) & 0x1ff;
    bitBuffer &= (1 << (bitCount - 9)) - 1;
    bitCount -= 9;

    // Convert back to 1-300 range
    result[numIndex++] = value + 1;
  }

  return result;
}

// Test function with compression metrics
function testCompression(numbers) {
  // Original representation
  const originalString = numbers.join(",");
  const originalSize = Buffer.from(originalString).length;

  // Compression
  const compressedStart = Date.now();
  const compressed = compressNumbers(numbers);
  const compressionTime = Date.now() - compressedStart;
  const compressedSize = Buffer.from(compressed).length;

  // Decompression
  const decompressStart = Date.now();
  const decompressed = decompressNumbers(compressed);
  const decompressionTime = Date.now() - decompressStart;

  // Verify correctness
  const isCorrect =
    numbers.length === decompressed.length &&
    numbers.every((n, i) => n === decompressed[i]);

  // Calculate metrics
  const ratio = compressedSize / originalSize;
  const spaceSaved = 1 - ratio;

  return {
    original: numbers.join(","),
    compressed,
    originalSize,
    compressedSize,
    ratio: ratio.toFixed(4),
    spaceSaved: `${(spaceSaved * 100).toFixed(2)}%`,
    compressionTime: `${compressionTime}ms`,
    decompressionTime: `${decompressionTime}ms`,
    verified: isCorrect,
  };
}

// Test cases
const testCases = [
  { name: "Empty Array", data: [] },
  { name: "Single Number", data: [150] },
  { name: "Small Array", data: [1, 300, 150, 42, 299] },
  {
    name: "Sorted Sequence",
    data: Array.from({ length: 50 }, (_, i) => i + 1),
  },
  {
    name: "Large Array",
    data: Array.from({ length: 1000 }, (_, i) => (i % 300) + 1),
  },
  { name: "All Max", data: Array(100).fill(300) },
  { name: "All Min", data: Array(100).fill(1) },
  {
    name: "Random Values",
    data: Array.from(
      { length: 500 },
      () => Math.floor(Math.random() * 300) + 1
    ),
  },
];

// Run tests
console.log("Compression Test Results:\n");
testCases.forEach((test, index) => {
  const result = testCompression(test.data);

  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(
    `  Original: [${test.data.slice(0, 5).join(",")}${
      test.data.length > 5 ? "..." : ""
    }] (${test.data.length} items)`
  );
  console.log(
    `  Compressed: "${result.compressed.slice(0, 20)}${
      result.compressed.length > 20 ? "..." : ""
    }"`
  );
  console.log(`  Original Size: ${result.originalSize} bytes`);
  console.log(`  Compressed Size: ${result.compressedSize} bytes`);
  console.log(`  Compression Ratio: ${result.ratio}`);
  console.log(`  Space Saved: ${result.spaceSaved}`);
  console.log(`  Compression Time: ${result.compressionTime}`);
  console.log(`  Decompression Time: ${result.decompressionTime}`);
  console.log(`  Verified: ${result.verified}\n`);
});
