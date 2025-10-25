const http = require('http');
const fs = require('fs');
const url = require('url');
const { Command } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');

const program = new Command();
program
  .requiredOption('-i, --input <path>', 'Input JSON file path') [cite: 257]
  .requiredOption('-h, --host <address>', 'Server host') [cite: 258]
  .requiredOption('-p, --port <port>', 'Server port', parseInt); [cite: 259]

try {
  program.parse(process.argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const options = program.opts();
const inputFilePath = options.input;

if (!fs.existsSync(inputFilePath)) {
  console.error('Cannot find input file'); [cite: 260]
  process.exit(1);
}
