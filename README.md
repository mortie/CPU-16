# CPU-16

This is a 16 bit logisim CPU, complete with a simple assembler.
The instruction set is detailed in [IS.md](https://github.com/mortie/CPU-16/blob/master/IS.md).

![Screenshot](https://raw.githubusercontent.com/mortie/CPU-16/master/images/cpu.png)

## Assembler

The assembler is written in javascript, and requires node.js to be installed.

	./assembler.js <infile> [outfile]
	./assembler.js --help

If `infile` is -, read from stdin. If `outfile` is -, write to stdout.
If `outfile` is omitted, write to `img.raw`.

After assembling, right click the block labeled `Program ROM`, click `load
image...`, and select the `.raw` file you just made.

## The assembly language, masm

### Registers:

* `A`: Register for ALU A input.
* `B`: Register for ALU B input.
* `RAM`: Register which can be used as a RAM address.
* `FLAG`: Flag register, for conditional jumps.

### Instructions

From `assembler.js -h`:

	<val>:
		'*'        : Value from RAM
		'$<number>': Number
		':<name>'  : Instruction with label <name>
		':current' : Current instruction
		'INPUT'    : External input (only load-a and load-b

	<opr>: A, GT, EQ, LT, NEQ, NOT_A, ADD, SUB, MUL, DIV, MOD, LSHIFT, RSHIFT, XOR, AND, OR

	Instructions:
		load-a <val>: Load A
			Load <val> to reg A.
		load-b <val>: Load B
			Load <val> to reg B.
		load-ram <val>: Load RAM register
			Load <val> to reg RAM.
		write <opr>: Write RAM
			Write A <opr> B to RAM.
		write-flag <opr>: Write FLAG register
			Write A <opr> B to FLAG.
		write-extern <opr>: Write externally
			Write A <opr> B externally.
		cjmp <opr>: Conditional jump
			Jump to A <opr> B if FLAG.
		jmp <opr>: Unconditional jump
			Unconditionally jump to A <opr> B.

### Preprocessor

* `#define name val`: Define a name. Any occurrence of that name later will be
  replaced.
* `#define name {`: Define a name, multiple lines. All lines until the next `}`
  will be included.
* `#include "path"`: Include a file, if it hasn't been included yet. Path is
  relative to the directory of the current file.
* `#include <path>`: Include a file like above. Path is relative to the
  directory the assembler was ran from.
