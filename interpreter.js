const mem = new Int32Array(128).fill(0);
let pointer = 0;
let inputBuffer = [];

const testProgram =
  "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

function replaceCharAt(str, index, char) {
  return `${str.substr(0, index)}${char}${str.substr(index + 1)}`;
}

function compile(input) {
  const braces = {};
  let tmp = input;

  while (true) {
    const match = tmp.match(/\[[^\[\]]*\]/);

    if (!match) {
      const hasOpen = tmp.includes("[");
      const hasClose = tmp.includes("]");

      if (hasOpen && !hasClose) throw new Error("Brace opened but not closed");
      if (hasClose && !hasOpen) throw new Error("Brace closed but not opened");

      break;
    }

    const start = match.index;
    const end = start + match[0].length - 1;

    braces[start] = end;
    tmp = replaceCharAt(tmp, start, "x");
    tmp = replaceCharAt(tmp, end, "x");
  }

  Object.entries(braces).map(([open, close]) => (braces[close] = open | 0));

  for (let i = 0; i < input.length; i++) {
    switch (input[i]) {
      case ">":
        pointer++;
        break;

      case "<":
        pointer--;
        break;

      case "+":
        mem[pointer]++;
        break;

      case "-":
        mem[pointer]--;
        break;

      case ".":
        console.log(mem[pointer]);
        break;

      case ",":
        mem[pointer] = inputBuffer.shift() | 0;
        break;

      case "[":
        if (mem[pointer] === 0) i = braces[i] + 1;
        break;

      case "]":
        if (mem[pointer] !== 0) i = braces[i];
        break;
    }
  }
}

compile(testProgram);
