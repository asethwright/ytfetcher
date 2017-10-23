const Download = require('./src/Download');
const fs = require('fs');
const chalk = require('chalk');
const csvWriter = require('csv-write-stream')();

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
  }
  csvWriter.end();
}

process();
