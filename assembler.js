#!/usr/bin/env node

var fs = require("fs");
var pathlib = require("path");

var labels = {};

var oprs = {
	A: 0,
	GT: 1,
	EQ: 2,
	LT: 3,
	NEQ: 4,
	NOT_A: 5,
	ADD: 6,
	SUB: 7,
	MUL: 8,
	DIV: 9,
	MOD: 10,
	LSHIFT: 11,
	RSHIFT: 12,
	XOR: 13,
	AND: 14,
	OR: 15
};

var defines = {};

function pad(n, val) {
	return new Array(n - val.length + 1).join("0") + val;
}

function readlines(file) {
	return fs.readFileSync(file, "utf-8").split("\n");
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
 * %10: value in RAM address 10
 * *10: value pointed to by value in RAM address 10
 * *: value pointed to by the value in register RREG
 * reg: Value in the register
 */
function loadVal(reg, val, output) {
	if (reg !== "A" && reg !== "B" && reg !== "OUT")
		throw new Error("Invalid register: "+reg);

	if (val === "reg")
		return;

	var instr;
	var num = parseInt(val.substr(1));
	if (isNaN(num) && val !== "*A")
		throw new Error("Invalid value: "+val);

	if (val[0] !== "$" && val[0] !== "%" && val[0] !== "*")
		throw new Error("Invalid value: "+val);

	// Load NUM to register
	if (val[0] === "$") {
		if (reg === "A")
			instr = 1;
		else if (reg === "B")
			instr = 2;
		else
			instr = 10;

	// Load RAM addr NUM to register
	} else if (val[0] === "%") {

		// We have to do some trickery to output from RAM addr n
		if (reg === "OUT") {
			loadVal("A", "$"+num, output);     // load RA
			output.push(13, 0, 0);             // load RREG from RA
			output.push(11, 0, 0);             // output RAM addr RREG
			return;
		}

		if (reg === "A")
			instr = 3;
		else if (reg === "B")
			instr = 4;
	} else if (val[0] === "*") {
		if (val !== "*")
			loadVal("A", "$"+num, output);

		if (reg === "A")
			instr = 14;
		else if (reg === "B")
			instr = 15;
		else
			instr = 11;
	}

	output.push(instruction(instr, 0, num));
}

/*
 * 1: RAM register 1
 * *: RAM register RREG
 */
function writeRam(val, opr, output) {
	if (val === "*") {
		output.push(instruction(11, opr, 0));
	} else {
		output.push(instruction(5, opr, val));
	}
}

function assembleLine(line, output) {
	var args = line.split(/\s+/).map(p => p.toLowerCase());
	if (args.length === 0)
		return;

	var opr = args[0];

	switch (opr) {
	case "load-a":
		loadVal("A", args[1], output);
		break;

	case "load-b":
		loadVal("B", args[1], output);
		break;

	case "write":
		loadVal("A", args[1], output);
		writeRam(args[3], 0, output);
		break;

	case "write-rreg":
		loadVal("A", args[1], output);
		output.push(instruction(13, 0, 0));
		break;

	case "goto-gt":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, oprs.GT, 0));
		output.push(instruction(6, 0, labels[args[3]]));
		break;

	case "goto-lt":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, oprs.LT, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto-eq":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, oprs.EQ, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto-neq":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		output.push(instruction(5, oprs.NEQ, 0));
		output.push(instruction(6, 0, labels[args[3]]))
		break;

	case "goto":
		output.push(instruction(8, 0, labels[args[1]]));
		break;

	case "not":
		loadVal("A", args[1], output);
		output.push(instruction(5, oprs.NOT_A, args[2]));
		break;

	case "add":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.ADD, output);
		break;

	case "sub":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.SUB, output);
		break;

	case "mul":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.MUL, output);
		break;

	case "div":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.DIV, output);
		break;

	case "mod":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.MOD, output);
		break;

	case "lshift":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.LSHIFT, output);
		break;

	case "rshift":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.RSHIFT, output);
		break;

	case "xor":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.XOR, output);
		break;

	case "and":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.AND, output);
		break;

	case "or":
		loadVal("A", args[1], output);
		loadVal("B", args[2], output);
		writeRam(args[3], oprs.OR, output);
		break;

	case "input":
		output.push(instruction(12, 0, 0));
		break;

	case "output":
		loadVal("OUT", args[1], output);
		break;
	}
}

var defines = {};

/*
 * Interpret pragmas, lines starting with #.
 * Returns:
 *     true if done, false if it needs the next line too
 */
var pragmaState = "normal";
var pragmaVal = null;
function pragma(str, cwd, output) {
	if (pragmaState === "in-define") {
		if (str.trim() === "}") {
			pragmaState = "normal";
			defines[pragmaVal.name] = pragmaVal.str;
			pragmaVal = null;
			return false;
		} else {
			pragmaVal.str += str + "\n";
			return true;
		}
	}

	if (pragmaState !== "normal")
		throw "Unknown pragmaState: "+pragmaState;

	var opr = str.split(/\s+/)[0];
	str = str.replace(opr, "").trim();

	switch (opr) {
	case "#define":
		var name = str.split(/\s+/)[0];
		str = str.replace(name, "").trim();
		if (str === "{") {
			pragmaVal = { str: "", name: name };
			pragmaState = "in-define";
			return true;
		} else {
			defines[name] = str;
		}
		break;

	case "#include":
		var relative;
		if (str[0] === "\"" && str[str.length - 1] === "\"")
			relative = true;
		else if (str[0] === "<" && str[str.length - 1] === ">")
			relative = false;
		else
			throw "Invalid include path";

		var path = str.substring(1, str.length - 1);
		if (relative)
			path = pathlib.join(cwd, path);
		else
			path = pathlib.join(process.cwd(), path);

		if (defines["INCLUDED_"+path] !== "1") {
			preprocess(readlines(path), pathlib.dirname(path)).forEach(l => {
				output.push(l);
			});

			defines["INCLUDED_"+path] = "1";
		}
	}

	return false;
}

function preprocess(lines, cwd) {
	var curr = 0;
	var outLines = [];
	var inPragma = false;

	lines.forEach((line, linenum) => {
		line = line.trim();
		if (line === "")
			return;

		if (inPragma) {
			inPragma = pragma(line);

		} else if (line[0] === ":") {
			var name = line.substr(1).split(/\s+/)[0];
			labels[name] = curr;

		} else if (line[0] === "#") {
			inPragma = pragma(line, cwd, outLines);

		} else {
			for (var i in defines) {
				line = line.split(i).join(defines[i]);
			}
			outLines.push(line);
			var output = [];
			try {
				assembleLine(line, output);
			} catch (err) {
				console.error("Line "+linenum+": "+err.message);
			}
			curr += output.length;
		}
	});

	return outLines;
}

function assemble(lines, cwd, print) {
	cwd = cwd || process.cwd();
	lines = preprocess(lines, cwd);

	if (print) {
		console.error("Preprocessor output:");
		lines.forEach(l => console.error(l));
	}

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

function usage() {
	console.error("Usage: "+process.argv[1]+" <infile|-> [outfile|-] [print]");
}

if (process.argv.length <= 2) {
	usage();
	process.exit(1);
}

var rs;
if (process.argv[2] === "-")
	rs = process.stdin;
else
	rs = fs.createReadStream(process.argv[2]);

var ws;
if (!process.argv[3])
	ws = fs.createWriteStream("img.raw");
else if (process.argv[3] === "-")
	ws = process.stdout;
else
	ws = fs.createWriteStream(process.argv[3]);

var printPreprocessor = process.argv[4] === "print";

(function() {
	var str = "";
	rs.on("data", d => str += d);
	rs.on("end", () => {
		var output = assemble(str.split("\n"), null, printPreprocessor);
		ws.write("v2.0 raw\n");
		output.forEach(l => ws.write(l+"\n"));
	});
})();
