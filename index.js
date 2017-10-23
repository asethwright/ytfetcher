const fs = require('fs');
const chalk = require('chalk');
const csvWriter = require('csv-write-stream')();

const Download = require('./src/Download');
const Converter = require('./src/XMLToVttConverter');

const list = fs.readFileSync('list.txt').toString();
let files = list.split("\n");

async function process () {
  csvWriter.pipe(fs.createWriteStream('dist/meta.csv'));

  for (let i in files) {
    if (!files[i] || files[i] === '') return;
    let dl = new Download({ url: files[i], csv: csvWriter });

    try {
      await dl.process();
    } catch (e) {
      console.log(chalk.red('! ERROR DOWNLOADING'));
    }

    try {
      let convert = new Converter({ id: dl.id, file: dl.paths.caption, length: dl.length });
      await convert.build();
    } catch (e) {
      console.log(chalk.red('! ERROR CONVERTING'));
    }
  }

  csvWriter.end();
}

process();
