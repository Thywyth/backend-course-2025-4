const http = require('http');
const fs = require('fs');
const url = require('url');
const { Command } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');

const program = new Command();
program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <address>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port', parseInt);

try {
  program.parse(process.argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const options = program.opts();
const inputFilePath = options.input;

if (!fs.existsSync(inputFilePath)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  fs.readFile(inputFilePath, 'utf8', (err, data) => {

    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error: Could not read file');
      return;
    }

    try {
      let cars = JSON.parse(data); 

      if (query.max_mpg) {
        cars = cars.filter(car => car.mpg < parseFloat(query.max_mpg));
      }

      const outputData = cars.map(car => {
        const carObject = {
          model: car.model, 
          ...(query.cylinders === 'true' && { cyl: car.cyl }),
          mpg: car.mpg
        };
        return carObject;
      });

      const builder = new XMLBuilder();
      const xmlOutput = builder.build({ cars: { car: outputData } });

      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xmlOutput);

    } catch (parseError) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error: Could not parse JSON');
    }
  });
});

server.listen(options.port, options.host, () => {
  console.log(`Server started at http://${options.host}:${options.port}`);
});