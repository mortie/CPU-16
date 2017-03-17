* Instruction (INS, 4)
* ALU Operation (OPR, 4)
* Number (NUM, 16)

|Instr |Hex| Description                     |
|:----:|:-:|:-------------------------------:|
| 0000 | 0 | NO-OP                           |
| 0001 | 1 | Write NUM to RA                 |
| 0010 | 2 | Write NUM to RB                 |
| 0011 | 3 | Write RAM address NUM to RA     |
| 0100 | 4 | Write RAM address NUM to RB     |
| 0101 | 5 | Write RAM address RRAM to RA    |
| 0110 | 6 | Write RAM address RRAM to RB    |
| 0111 | 7 | Write RAM address NUM to RRAM   |
| 1000 | 8 | Write RAM address RRAM to RRAM  |
| 1001 | 9 | Write OUT to RAM address NUM    |
| 1010 | A | Write OUT to RAM address RRAM   |
| 1011 | B | JMP to NUM if FLAG              |
| 1100 | C | JMP to RAM address NUM if FLAG  |
| 1101 | D | JMP to RAM address RRAM if FLAG |
| 1110 | E | JMP to NUM                      |
| 1111 | F | JMP to RAM address NUM          |

|ALU OP|Hex| Name    | Output |
|:----:|:-:|:-------:|:------:|
| 0000 | 0 | NO-OP   | N/A    |
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
