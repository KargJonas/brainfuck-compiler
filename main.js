async function run() {
  const testProgram = await fetch("program.bf")
    .then(res => res.text());

  const inputBuffer = [84, 101, 115, 116];
  const outputBuffer = [];

  runProgram(testProgram, outputBuffer, inputBuffer, 7);

  const ascii = outputBuffer.map(char => String.fromCharCode(char)).join("");

  console.log(ascii);
}

run();