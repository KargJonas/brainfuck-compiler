function replaceCharAt(str, index, char) {
  return `${ str.substr(0, index) }${ char }${ str.substr(index + 1) }`;
}

function validatePointer(pointer, memorySize) {
  if (0 <= pointer && pointer < memorySize) return pointer;
  const error = new Error(`Pointer 0x${pointer.toString(16)} outside of address range (0x0 - 0x${(memorySize - 1).toString(16)}).`);
  error.name = "Memory Error";
  throw error;
}

function runProgram(input, outputBuffer, inputBuffer, memorySize = 128) {
  if (memorySize < 1) throw new Error(`Invalid memory size: ${memorySize}`);
  if (!(outputBuffer instanceof Array)) console.warn("No output buffer provided.");
  if (!(inputBuffer instanceof Array)) console.warn("No input buffer provided.");

  const memory = new Int32Array(memorySize).fill(0);
  const rawTokens = input.split("");
  const tokens = [];

  let pointer = programState = column = 0;
  let rawInstructionList = "";
  let line = 1;

  const instructionLookup = {
    ">": () => validatePointer(++pointer, memorySize),
    "<": () => validatePointer(--pointer, memorySize),
    "+": () => memory[pointer]++,
    "-": () => memory[pointer]--,
    ".": () => outputBuffer.push(memory[pointer]),
    ",": () => memory[pointer] = inputBuffer.shift() | 0,
    "[": () => memory[pointer] === 0 ? (programState = tokens[programState].jump + 1) : 0,
    "]": () => memory[pointer] !== 0 ? (programState = tokens[programState].jump) : 0
  };

  for (const token of rawTokens) {
    if (token === "\n") {
      line++;
      column = 0;
      continue;
    }

    column++;

    const instruction = instructionLookup[token];
    if (!instruction) continue;
    rawInstructionList += token;

    tokens.push({
      instruction,
      line,
      column,
      raw: token,
      jump: null
    });
  }

  while (true) {
    // Matching two braces.
    const match = rawInstructionList.match(/\[[^\[\]]*\]/);

    if (!match) {
      const openBraceIndex = rawInstructionList.indexOf("[");
      const closeBraceIndex = rawInstructionList.indexOf("]");
      const hasOpenBrace = openBraceIndex > -1;
      const hasCloseBrace = closeBraceIndex > -1;

      if (hasOpenBrace && !hasCloseBrace) {
        const token = tokens[openBraceIndex];
        throw new Error(`Brace opened but not closed @ ${ token.line }:${ token.column }`);
      }

      if (hasCloseBrace && !hasOpenBrace) {
        const token = tokens[closeBraceIndex];
        throw new Error(`Brace closed but not opened @ ${ token.line }:${ token.column }`);
      }

      break;
    }

    const start = match.index;
    const end = start + match[0].length - 1;

    // Adding information to "[" and "]" tokens on where their counterpart is.
    tokens[start].jump = end;
    tokens[end].jump = start;

    // Removing the matched tokens to prevent matching them agin.
    rawInstructionList = replaceCharAt(rawInstructionList, start, 0);
    rawInstructionList = replaceCharAt(rawInstructionList, end, 0);
  }

  // Running the instruction of each token
  for (programState = 0; programState < tokens.length; programState++) {
    tokens[programState].instruction();
  }

  return outputBuffer;
}