# CPU-16

This is a 16 bit logisim CPU, complete with a simple assembler.
The instruction set is detailed in [IS.md](https://github.com/mortie/CPU-16/blob/master/IS.md).

![Screenshot](https://raw.githubusercontent.com/mortie/CPU-16/master/assets/screenshot.png)

Here's a video fo the CPU running fibonacci (pay attention to RAM address
0003):
[https://vid.me/K5x0](https://vid.me/K5x0)

## Assembler

The assembler is written in javascript, and requires node.js to be installed.
Its interface is really simple, reading input from stdin and writing output to
stdout:

	./assembler.js <examples/fibonacci.masm >fibonacci.raw

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
* `sub reg $4 3`: Subtract 4 from whatever is in register A, and store the
  result to address 3.

More example code is in the [examples/
directory](https://github.com/mortie/CPU-16/tree/master/examples).

### Instructions

* `:<name>`: Create a label.
* `load-a <num>`: Load the A register with `num`.
* `load-b <num>`: Load the B register with `num`.
* `write <num> <dest>`: Write `num` to address `dest`.
* `goto-gt <a> <b> <label>`: Go to `label` if `a > b`.
* `goto-lt <a> <b> <label>`: Go to `label` if `a < b`.
* `goto-eq <a> <b> <label>`: Go to `label` if `a == b`.
* `goto-neq <a> <b> <label>`: Go to `label` if `a != b`.
* `goto <label>`: Unconditionally jump to `label`.
* `not <num> <dest>`: Invert `num`, write to `dest`.
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
