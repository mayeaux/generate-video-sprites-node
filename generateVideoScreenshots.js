const ffmpeg = require('fluent-ffmpeg');

const format = 'image2';

async function convertToMostCompatible(
  {
    path, fps, size, outputFolder
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(path)
      .fps(fps)
      .format(format)
      .outputOptions(`-s ${size}`)
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        console.log(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {

        console.log('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}/thumb-%d.png`);
  })
}

module.exports = convertToMostCompatible;

// convertToMostCompatible()
