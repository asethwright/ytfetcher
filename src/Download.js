const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const ytdl = require('ytdl-core');
const got = require('got');

class Download {
  constructor (params) {
    this.url = params.url;
    let split = this.url.split('/').slice(-1);
    this.id = split[split.length - 1];
    this.csv = params.csv;
    this.output = path.join(__dirname, 'dist');
    console.log(chalk.magenta(`> New download -> ${this.id}`));
  }

  async process () {
    return new Promise(async (resolve, reject) => {
      try {
        await this.meta();
      } catch (e) {
        console.log(chalk.red('  Meta Error.'));
      }

      try {
        await this.captions();
      } catch (e) {
        console.log(chalk.red('  Caption Error.'));
      }

      try {
        await this.video();
      } catch (e) {
        console.log(chalk.red('  Video Error.'));
      }

      console.log('');
      resolve();
    });
  }

  async captions () {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('  Fetching captions...'));
      ytdl.getInfo(this.id, (err, info) => {
        if (err) {
          reject(err);
          return;
        }

        var tracks = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
        var track = tracks[tracks.length - 1];

        got(track.baseUrl)
          .then((response) => {
            console.log(chalk.blue('  Writing captions...'));
            fs.writeFileSync(`dist/captions/${this.id}.xml`, response.body);
            console.log(chalk.green('  Done.'));
            console.log('');
            resolve();
          });
      });
    });
  }

  async meta () {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('  Fetching meta...'));
      ytdl.getInfo(this.id, (err, info) => {
        if (err) {
          reject(err);
          return;
        }

        let poster = info.iurlhq720 || info.iurlhq;
        console.log(chalk.blue(`  Title: `) + info.title);
        console.log(chalk.blue(`  Poster: `) + poster);

        console.log(chalk.blue(`  Downloading Poster...`));
        var dl = got.stream(poster)
        dl.pipe(fs.createWriteStream(`dist/posters/${this.id}.jpg`))
        dl.on('response', (response) => {
            console.log(chalk.blue(`  Writing Meta...`));
            this.csv.write({
              id: this.id,
              title: info.title,
              keywords: JSON.stringify(info.keywords),
              length: info.length_seconds
            });

            console.log(chalk.green('  Done.'));
            console.log('');

            resolve();
        });
      });
    });
  }

  async video () {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('  Starting download...'));
      let video = ytdl(this.url, {
        filter: (format) => format.container === 'mp4'
      })
      video.pipe(fs.createWriteStream(`dist/vids/${this.id}.mp4`));
      video.on('end', () => {
        console.log(chalk.green('  Done.'));
        console.log('');
        resolve();
      });
    });
  }
}

module.exports = Download;
