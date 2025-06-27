function compressNumbers(numbers) {
}


function decompressNumbers(compressed) {
}


function testCompression(numbers) {
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
});
