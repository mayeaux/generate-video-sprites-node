const ffmpeg = require('fluent-ffmpeg');

/**
 *
 * @param path
 * @param fps
 * @param size
 * @param outputFolder
 * @returns {Promise<unknown>}
 */
async function generateVideoScreenshots(
  {
    path, fps, size, outputFolder
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(path)
      .outputOptions(`-vf`)
      .outputOptions(`fps=${fps}`)
      .outputOptions(`-s ${size}`)
      .on('start', function (commandLine) {
        c.l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        c.l(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        c.l('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}/thumb-%d.png`);
  })
}

module.exports = generateVideoScreenshots;
