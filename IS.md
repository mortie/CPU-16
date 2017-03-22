* Instruction (INS, 4)
* ALU Operation (OPR, 4)
* Number (NUM, 16)

|Instr |Hex| Description                       |
|:----:|:-:|:----------------------------------|
| 0000 | 0 | NO-OP                             |
| 0001 | 1 | Load NUM to RA                    |
| 0010 | 2 | Load NUM to RB                    |
| 0011 | 3 | Load RAM address NUM to RA        |
| 0100 | 4 | Load RAM address NUM to RB        |
| 0101 | 5 | Write OUT to RAM address NUM      |
| 0110 | 6 | JMP to NUM if FLAG                |
| 0111 | 7 | JMP to RAM address NUM if FLAG    |
| 1000 | 8 | JMP to NUM                        |
| 1001 | 9 | JMP to RAM address NUM            |
| 1010 | A | Output NUM externally             |
| 1011 | B | Output RAM address RREG externally|
| 1100 | C | Write external input to RA        |
| 1101 | D | Write OUT to RREG                 |
| 1110 | E | Write RAM addess RREG to RA       |
| 1111 | F | Write RAM address RREG to RB      |

|ALU OP|Hex| Name    | Output |
|:----:|:-:|:--------|:------:|
| 0000 | 0 | A       | OUT    |
| 0001 | 1 | A GT B  | FLAG   |
| 0010 | 2 | A EQ B  | FLAG   |
| 0011 | 3 | A LT B  | FLAG   |
| 0100 | 4 | A NEQ B | FLAG   |
| 0101 | 5 | NOT A   | OUT    |
| 0110 | 6 | A ADD B | OUT    |
| 0111 | 7 | A SUB B | OUT    |
| 1000 | 8 | A MUL B | OUT    |
| 1001 | 9 | A DIV B | OUT    |
| 1010 | A | A MOD B | OUT    |
| 1011 | B | A << B  | OUT    |
| 1100 | C | A >> B  | OUT    |
| 1101 | D | A XOR B | OUT    |
| 1110 | E | A AND B | OUT    |
| 1111 | F | A OR B  | OUT    |
