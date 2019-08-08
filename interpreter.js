const mem = new Int32Array(128).fill(0);
let pointer = 0;
let inputBuffer = [];

const testProgram =
  "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

function replaceCharAt(str, index, char) {
  return `${str.substr(0, index)}${char}${str.substr(index + 1)}`;
}

function compile(input) {
  const jumps = {};
  let tmp = input;

  while (true) {
    const match = tmp.match(/\[[^\[\]]*\]/);

    if (!match) {
      const hasOpenBrace = tmp.includes("[");
      const hasCloseBrace = tmp.includes("]");
      if (hasOpenBrace && !hasCloseBrace) throw new Error("Brace opened but not closed");
      if (hasCloseBrace && !hasOpenBrace) throw new Error("Brace closed but not opened");
      break;
    }

    const start = match.index;
    const end = start + match[0].length - 1;

    jumps[start] = end;
    tmp = replaceCharAt(tmp, start, "x");
    tmp = replaceCharAt(tmp, end, "x");
  }

  Object.entries(jumps).map(([open, close]) => (jumps[close] = open | 0));

  let programState;

  const lookup = {
    ">": () => pointer++,
    "<": () => pointer--,
    "+": () => mem[pointer]++,
    "-": () => mem[pointer]--,
    ".": () => console.log(mem[pointer]),
    ",": () => mem[pointer] = inputBuffer.shift() | 0,
    "[": () => mem[pointer] === 0 ? programState = jumps[programState] + 1 : 0,
    "]": () => mem[pointer] !== 0 ? programState = jumps[programState] : 0,
  };

  for (programState = 0; programState < input.length; programState++) {
    const command = lookup[input[programState]];
    if (command) command();
  }
}

compile(testProgram);
