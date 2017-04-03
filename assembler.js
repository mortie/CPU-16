#!/usr/bin/env node

var fs = require("fs");
var pathlib = require("path");

var labels = {};
var ignoreLabels = false;

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

function instruction(instr, opname, _num) {
	var opr;
	if (opname === 0)
		opr = oprs.A;
	else if (typeof oprs[opname] !== "undefined")
		opr = oprs[opname];
	else
		throw new Error("Unknown operation: "+opname);

	var num = _num;
	if (num === undefined)
		num = 0;
	if (typeof num === "string")
		num = parseInt(num);

	if (isNaN(num))
		throw new Error("Invalid number: "+_num);

	var numstr = num.toString(16).toUpperCase();
	return (instr.toString(16)) +
		(opr.toString(16)) +
		pad(4, numstr);
}

/*
 * * - value in RAM register
 * $<number> - number
 * :<name> - label
 * :current - current instruction
 * INPUT - external input
 */
function loadVal(reg, val, output) {
	function loadNum(num) {
		if (reg === "A")
			output.instr(1, 0, num);
		else if (reg === "B")
			output.instr(2, 0, num);
		else if (reg === "RAM")
			output.instr(3, 0, num);
		else
			throw new Error("Unknown register: "+reg);
	}

	// Value in RAM register
	if (val === "*") {
		if (reg === "A")
			output.instr(4, 0, 0);
		else if (reg === "B")
			output.instr(5, 0, 0);
		else if (reg === "RAM")
			output.instr(6, 0, 0);
		else
			throw new Error("Unknown register: "+reg);

	// Number
	} else if (val[0] === "$") {
		var num = parseInt(val.substring(1));
		if (isNaN(num))
			throw new Error("Invalid value: "+val);

		loadNum(num);

	// Current instruction
	} else if (val === ":current") {
		loadNum(output.length);

	// Label
	} else if (val[0] === ":") {
		var num = labels[val.substring(1)];

		if (typeof num !== "number") {
			if (ignoreLabels)
				num = 0;
			else
				throw new Error("Invalid label: "+val.substring(1));
		}

		loadNum(num);

	// External input
	} else if (val === "INPUT") {
		if (reg === "A")
			output.instr(11, 0, 0);
		else if (reg === "B")
			output.instr(12, 0, 0);
		else
			throw new Error("Value INPUT is only applicable to registers A and B.");

	// Invalid
	} else {
		throw new Error("Invalid value: "+val);
	}
}

var instrs = {
	"load-a": {
		args: [ "val" ],
		name: "Load A",
		desc: "Load <val> to reg A.",
		fn: (output, val) => loadVal("A", val, output)
	},

	"load-b": {
		args: [ "val" ],
		name: "Load B",
		desc: "Load <val> to reg B.",
		fn: (output, val) => loadVal("B", val, output)
	},

	"load-ram": {
		args: [ "val" ],
		name: "Load RAM register",
		desc: "Load <val> to reg RAM.",
		fn: (output, val) => loadVal("RAM", val, output)
	},

	"write": {
		args: [ "opr" ],
		name: "Write RAM",
		desc: "Write A <opr> B to RAM.",
		fn: (output, opr) => output.instr(7, opr, 0)
	},

	"write-flag": {
		args: [ "opr" ],
		name: "Write FLAG register",
		desc: "Write A <opr> B to FLAG.",
		fn: (output, opr) => output.instr(8, opr, 0)
	},

	"write-extern": {
		args: [ "opr" ],
		name: "Write externally",
		desc: "Write A <opr> B externally.",
		fn: (output, opr) => output.instr(13, opr, 0)
	},

	"cjmp": {
		args: [ "opr" ],
		name: "Conditional jump",
		desc: "Jump to A <opr> B if FLAG.",
		fn: (output, opr) => output.instr(9, opr, 0)
	},

	"jmp": {
		args: [ "opr" ],
		name: "Unconditional jump",
		desc: "Unconditionally jump to A <opr> B.",
		fn: (output, opr) => output.instr(10, opr, 0)
	},
}

function assembleLine(line, output, ignoreLabels) {
	var args = line.split(/\s+/);
	if (args.length === 0)
		return;

	var instrname = args[0];
	args.shift();

	var instr = instrs[instrname];
	if (typeof instr !== "object")
		throw new Error("Unknown instruction: "+instrname);
	if (args.length !== instr.args.length)
		throw new Error("Expected "+instr.args.length+" arguments, got "+args.length);

	args.splice(0, 0, output);
	instr.fn.apply(null, args);
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

function instrStream() {
	var arr = [];
	arr.instr = (instr, opr, num) => arr.push(instruction(instr, opr, num));
	return arr;
}

function preprocess(lines, cwd) {
	var curr = 0;
	var outLines = [];
	var inPragma = false;
	var errs = false;
	ignoreLabels = true;

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
			var output = instrStream();
			try {
				assembleLine(line, output, true);
			} catch (err) {
				console.error("Line "+(linenum+1)+": "+err.message);
				errs = true;
			}
			curr += output.length;
		}
	});

	if (errs) {
		console.log("Exiting.");
		process.exit(1);
	}

	ignoreLabels = false;

	return outLines;
}

function assemble(lines, cwd, print) {
	cwd = cwd || process.cwd();
	lines = preprocess(lines, cwd);

	if (print) {
		console.error("Preprocessor output:");
		lines.forEach(l => console.error(l));
	}

	var output = instrStream();
	for (var i in lines) {
		var line = lines[i];

		try {
			assembleLine(line, output);
		} catch (err) {
			console.log(err);
			console.error("Exiting.");
			process.exit(1);
		}
	}

	return output;
}

function usage() {
	console.log("Usage: "+process.argv[1]+" <infile|-> [outfile|-] [print]");
	console.log("       "+process.argv[1]+" -h, --help")
}

function help() {
	usage();
	console.log();
	console.log("<val>:");
	console.log("\t'*'        : Value from RAM");
	console.log("\t'$<number>': Number");
	console.log("\t':<name>'  : Instruction with label <name>");
	console.log("\t':current' : Current instruction");
	console.log("\t'INPUT'    : External input (only load-a and load-b");
	console.log();
	console.log("<opr>:", Object.keys(oprs).join(", "));
	console.log();
	console.log("Instructions:");
	Object.keys(instrs).forEach(i => {
		var instr = instrs[i];
		var args = instr.args.map(a => "<"+a+">").join(" ");
		console.log("\t"+i+" "+args+": "+instr.name);
		console.log("\t\t"+instr.desc);
	});
}

if (process.argv[2] === "-h" || process.argv[2] === "--help") {
	help();
	process.exit(0);
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
