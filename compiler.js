const testProgram =
  "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

function compile(input, memSize = 128) {
  let commands = [];

  function addCommand(command) {
    commands.push(command);
  }

  addCommand("let inputBuffer = [];");
  addCommand("(() => {");
  addCommand(`const mem = new Int32Array(${memSize}).fill(0);`);
  addCommand("let pointer = commandIndex = i = 0;");

  function replaceCharAt(str, index, char) {
    return `${str.substr(0, index)}${char}${str.substr(index + 1)}`;
  }

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
  addCommand(`const jumps = ${JSON.stringify(braces)};`);

  const lookup = {
    ">": "() => pointer++",
    "<": "() => pointer--",
    "+": "() => mem[pointer]++",
    "-": "() => mem[pointer]--",
    ".": "() => console.log(mem[pointer])",
    ",": "() => mem[pointer] = inputBuffer.shift() | 0",
    "[": "() => mem[pointer] === 0 ? i = jumps[i] + 1 : 0",
    "]": "() => mem[pointer] !== 0 ? i = jumps[i] : 0"
  };

  addCommand("const commandList = [");
  let commandListLength = 0;

  for (let i = 0; i < input.length; i++) {
    const command = lookup[input[i]] || "";
    if (!command) continue;
    addCommand(`${command},`);
    commandListLength++;
  }

  addCommand("];");
  addCommand(`for (i = 0; i < ${commandListLength}; i++) commandList[i].call();`);
  addCommand("})();");

  return commands.join("\n");
}

// To test it:
console.log(compile(testProgram, 128));