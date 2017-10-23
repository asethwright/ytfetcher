const fs = require('fs');
const xml2js = require('xml2js');
const chalk = require('chalk');

class XMLToVttConverter {
  constructor (params) {
    console.log(chalk.yellow('  Converting captions...'));
    this.id = params.id;
    this.file = params.file;
    this.stream = fs.readFileSync(this.file);
    this.length = params.length;
    this.xml = this.stream.toString();
    this.json = null;
    this.output = "WEBVTT";
  }

  async build () {
    return new Promise(async (resolve, reject) => {
      xml2js.parseString(this.xml, (err, result) => {
        if (err) {
          throw err;
          reject();
        }

        this.json = result;

        for (var i in this.json.transcript.text) {
          let num = parseInt(i) + 1
          let start = Number(this.json.transcript.text[i].$.start);
          let end = start + Number(this.json.transcript.text[i].$.dur);
          if (!end) end = Number(this.length);
          this.output += `\n\n${num}\n`;
          this.output += `${this.timeConvert(start)} --> ${this.timeConvert(end)}\n`;
          this.output += this.json.transcript.text[i]['_'];
        }

        fs.writeFileSync(`dist/vtt/${this.id}.vtt`, this.output);
        resolve();
      });
    });
  }

  timeConvert (seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;
    seconds = seconds.toFixed(3);
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return `${hours}:${minutes}:${seconds}`;
  }
}

module.exports = XMLToVttConverter;
