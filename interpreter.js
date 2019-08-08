function replaceCharAt(str, index, char) {
  return `${ str.substr(0, index) }${ char }${ str.substr(index + 1) }`;
}

function runProgram(input) {
  const instructionLookup = {
    ">": () => pointer++,
    "<": () => pointer--,
    "+": () => memory[pointer]++,
    "-": () => memory[pointer]--,
    ".": () => outputBuffer.push(memory[pointer]),
    ",": () => memory[pointer] = inputBuffer.shift() | 0,
    "[": () => memory[pointer] === 0 ? (programState = tokens[programState].jump + 1) : 0,
    "]": () => memory[pointer] !== 0 ? (programState = tokens[programState].jump) : 0
  };

  const memory = new Int32Array(128).fill(0);
  const inputBuffer = new Int32Array();
  const outputBuffer = new Int32Array();
  const rawTokens = input.split("");
  const tokens = [];

  let rawInstructionList = "";
  let line = column = 1;
  let pointer = programState = 0;

  for (const token of rawTokens) {
    if (token === "\n") {
      line++;
      column = 1;
      continue;
    }

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

    // Error/Finish checking.
    if (!match) {
      const hasOpenBrace = rawInstructionList.includes("[");
      const hasCloseBrace = rawInstructionList.includes("]");
      if (hasOpenBrace && !hasCloseBrace) throw new Error("Brace opened but not closed");
      if (hasCloseBrace && !hasOpenBrace) throw new Error("Brace closed but not opened");
      break;
    }

    // The indices of the opening and closing braces.
    const start = match.index;
    const end = start + match[0].length - 1;

    // Adding information to "[" and "]" tokens on where their counterpart is.
    tokens[start].jump = end;
    tokens[end].jump = start;

    // Removing the matched tokens to prevent matching them agin.
    rawInstructionList = replaceCharAt(rawInstructionList, start, 0);
    rawInstructionList = replaceCharAt(rawInstructionList, end, 0);
  }

  for (programState = 0; programState < tokens.length; programState++) {
    tokens[programState].instruction();
  }

  return outputBuffer;
}