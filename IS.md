* Instruction (INS, 4)
* ALU Operation (OPR, 4)
* Number (NUM, 16)

* Registers:
	* RA: ALU input A
	* RB: ALU input B
	* RRAM: RAM address
	* RFLAG: FLAG, for JMP

|Instr |Hex| Description               |
|:----:|:-:|:-------------------------:|
| 0000 | 0 | NO-OP                     |
| 0001 | 1 | Load NUM to RA            |
| 0010 | 2 | Load NUM to RB            |
| 0011 | 3 | Load NUM to RRAM          |
| 0100 | 4 | Load RAM to RA            |
| 0101 | 5 | Load RAM to RB            |
| 0110 | 6 | Load RAM to RRAM          |
| 0111 | 7 | Write RAM                 |
| 1000 | 8 | Write RFLAG               |
| 1001 | 9 | JMP if RFLAG              |
| 1010 | A | JMP                       |
| 1011 | B | Load external input to RA |
| 1100 | C | Load external input to RB |
| 1101 | D | Write externally          |
| 1110 | E | NO-OP                     |
| 1111 | F | NO-OP                     |

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
