#!/usr/bin/env node

var labels = {};

function pad(n, val) {
	return new Array(n - val.length + 1).join("0") + val;
}

function instruction(instr, op, _num) {
	var num = _num;
	if (num === undefined)
		num = 0;
	if (typeof num === "string")
		num = parseInt(num);

	if (isNaN(num))
		throw new Error("Invalid number: "+_num);

	var numstr = num.toString(16).toUpperCase();
	return (instr.toString(16)) +
		(op.toString(16)) +
		pad(4, numstr);
}

/*
 * $10: 10
 * %10: value pointed to by RAM address 10
 * reg: Value in the register
 */
function loadVal(reg, val, output) {
	if (reg !== "A" && reg !== "B")
		throw new Error("Invalid register: "+reg);

	if (num === "reg")
		return;

	var instr;
	var offset = reg === "A" ? 0 : 1;
	var num = parseInt(val.substr(1));
	if (isNaN(num))
		throw new Error("Invalid value: "+val);

	// $10
	if (val[0] === "$") {
		instr = 1;

	// %10
	} else if (val[0] === "%") {
		instr = 3;

	} else {
		throw new Error("Invalid value: "+val);
	}

	output.push(instruction(instr + offset, 0, num));
}

function assembleLine(line, output) {
	var args = line.split(/\s+/).map(p => p.toLowerCase());
	if (args.length === 0)
		return;

	var opr = args[0];
	if (opr[0] === ":" || opr[0] === "#")
		return;

	switch (opr) {
	case "load-a":
		loadVal("A", args[1], output);
		break;

	case "load-b":
		loadVal("B", args[1], output);
		break;

	case "write":
		loadVal("A", args[1], output);
		output.push(instruction(5, 0, args[2]));
		break;

	case "goto-gt":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 1, 0));
		output.push(instruction(6, 0, labels[args[3]]));
		break;

	case "goto-lt":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 3, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto-eq":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 2, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto-neq":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 4, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto":
		output.push(instruction(8, 0, labels[args[1]]));
		break;

	case "not":
		loadVal("A", args[1], output);
		output.push(instruction(5, 5, args[2]));
		break;

	case "add":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 6, args[3]));
		break;

	case "sub":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 7, args[3]));
		break;

	case "mul":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 8, args[3]));
		break;

	case "div":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 9, args[3]));
		break;

	case "mod":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 10, args[3]));
		break;

	case "lshift":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 11, args[3]));
		break;

	case "rshift":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 12, args[3]));
		break;

	case "xor":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 13, args[3]));
		break;

	case "and":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 14, args[3]));
		break;

	case "or":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, 15, args[3]));
		break;
	}
}

function preprocess(lines) {
	var curr = 0;
	lines.forEach((line, linenum) => {
		if (line[0] === ":") {
			var name = line.substr(1).split(/\s+/)[0];
			labels[name] = curr;
		} else {
			var output = [];
			try {
				assembleLine(line, output);
			} catch (err) {
				console.error("Line "+linenum+": "+err.message);
			}
			curr += output.length;
		}
	});
}

function assemble(lines) {
	preprocess(lines);

	var output = [];
	for (var i in lines) {
		var line = lines[i];

		try {
			assembleLine(line, output);
		} catch (err) {
			console.error("Exiting.");
			process.exit(1);
		}
	}

	return output;
}

var str = "";
process.stdin.on("data", d => str += d.toString());
process.stdin.on("end", () => {
	var output = assemble(str.split("\n"));
	console.log("v2.0 raw");
	output.forEach(l => console.log(l));
});
