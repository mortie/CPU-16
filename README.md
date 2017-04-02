# CPU-16

This is a 16 bit logisim CPU, complete with a simple assembler.
The instruction set is detailed in [IS.md](https://github.com/mortie/CPU-16/blob/master/IS.md).

![Screenshot](https://raw.githubusercontent.com/mortie/CPU-16/master/images/cpu.png)

Here's a video fo the CPU running fibonacci (pay attention to RAM address
0003):
[https://vid.me/K5x0](https://vid.me/K5x0)

Note: after making that video, I put the CPU in a subcircuit. The operation of
the CPU can still be viewed by right clicking the CPU and pressing `View CPU`.

## Assembler

The assembler is written in javascript, and requires node.js to be installed.

	./assembler.js <infile> [outfile]

If `infile` is -, read from stdin. If `outfile` is -, write to stdout.
If `outfile` is omitted, write to `img.raw`.

After assembling, right click the block labeled `Program ROM`, click `load
image...`, and select the `.raw` file you just made.

## The assembly language, masm

**NOTE**: When using goto, RAM address 0 will be set to 0.

* Most instructions take some form of value. In masm, `$n` is a literal number,
  while `%n` is a number read from RAM - `$10` is a literal 10, while `%10` is
  the number in RAM address 10. `$0x10`  (or `%0x10`) can also be used,
  for hex numbers. `reg` leaves the register unchanged.
* Many instructions write a result to RAM. The RAM address is generally the
  last argument, and is just a plain number (or a hex number as before).
* Lines starting with `:` is a label, so `:foo` will create a label named
  `foo`.

### Example

* `write $10 2`: Write 10 to RAM address 2.
* `write %10 2`: Write the content of RAM address 10 to RAM address 2.
* `add $10 $3 4`: Add 10 and 3 together, and write the result to address 4.
* `sub %3 $4 5`: Subtract 4 from the content of RAM address 3, and write the
  result to address 5.
* `sub r $4 3`: Subtract 4 from whatever is in register A, and store the
  result to address 3.

More example code is in the [examples/
directory](https://github.com/mortie/CPU-16/tree/master/examples).

### Instructions

Registers:

* `RA`: Register for ALU A input.
* `RB`: Register for ALU B input.
* `RRAM`: Register which can be used as a RAM address.

Format:

* `<label>`: The name of a label. Can be anything other than whitespace.
* `<val>`, `<a>`, `<b>`: Value. Possible values:
	* `$n`: The number n.
	* `%n`: The number in register n.
	* `*n`: The number in the register pointed to by register n.
	* `*`: The number pointed to by the RAM address register (`RREG`).
	* `r`: The number already in the register.
* `<dest>`: Destination RAM address. Possible values:
	* `n`: RAM address n.
	* `*`: RAM address in RREG.

Operations:

* `:<label>`: Create a label.
* `load-a <val>`: Load the A register with `val`.
* `load-b <val>`: Load the B register with `val`.
* `write <val> <dest>`: Write `val` to address `dest`.
* `write-rreg <val>`: Write `val` to register RREG.
* `goto-gt <a> <b> <label>`: Go to `label` if `a > b`.
* `goto-lt <a> <b> <label>`: Go to `label` if `a < b`.
* `goto-eq <a> <b> <label>`: Go to `label` if `a == b`.
* `goto-neq <a> <b> <label>`: Go to `label` if `a != b`.
* `goto <label>`: Unconditionally jump to `label`.
* `not <val> <dest>`: Invert `val`, write to `dest`.
* `add <a> <b> <dest>`: Add `a` and `b`, write to `dest`.
* `sub <a> <b> <dest>`: Sub `a` and `b`, write to `dest`.
* `mul <a> <b> <dest>`: Multiply `a` and `b`, write to `dest`.
* `div <a> <b> <dest>`: Divide `a` and `b`, write to `dest`.
* `mod <a> <b> <dest>`: Modulo `a` and `b`, write to `dest`.
* `lshift <a> <b> <dest>`: Shift `a` left `b` times, write to `dest`.
* `rshift <a> <b> <dest>`: Shift `a` right `b` times, write to `dest`.
* `xor <a> <b> <dest>`: XOR `a` and `b`, write to `dest`.
* `and <a> <b> <dest>`: AND `a` and `b`, write to `dest`.
* `or <a> <b> <dest>`: OR `a` and `b`, write to `dest`.
* `input`: Write external input to RA.
* `output <val>`: Write `val` to external output.
* `halt`: Halt.

### Preprocessor

* `#define name val`: Define a name. Any occurrence of that name later will be
  replaced.
* `#define name {`: Define a name, multiple lines. All lines until the next `}`
  will be included.
* `#include "path"`: Include a file, if it hasn't been included yet. Path is
  relative to the directory of the current file.
* `#include <path>`: Include a file like above. Path is relative to the
  directory the assembler was ran from.
