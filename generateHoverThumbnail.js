const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require("ffprobe");
const which = require('which')

const l = console.log;

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
const ffprobePath = which.sync('ffprobe')

// algorithm, 1/4 the way in , 5 seconds at 2x speed


async function main(){
  const inputFilePath = './examples/assets/output10.mp4';

  const ffprobeResponse = await ffprobe(inputFilePath, { path: ffprobePath });

  const videoStream = ffprobeResponse.streams.filter(stream => stream.codec_type === 'video')[0];

  l(videoStream);

  const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

  l(videoDurationInSeconds);

  // await generateHoverPreviewThumbnail({ path: inputFilePath, outputFolder: '.' })

  // await trimFile({ path: inputFilePath, outputFolder: '.' })

  await speedUpFile({ path: inputFilePath, outputFolder: '.' })
}

main();

const FRAMERATE = 6;
const WIDTH = 320;
const HEIGHT = 180;
// Set compression of webp images between 1-100 with 100 being perfect.
const QUALITY = 70;
const AMOUNT_OF_SECONDS = 5;
const STARTING_SECONDS = 24; // TODO: replace with length getting algorithm

/**
 *
 * @param path
 * @param fps
 * @param size
 * @param outputFolder
 * @returns {Promise<unknown>}
 */
async function generateHoverPreviewThumbnail(
  {
    path, outputFolder
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(path)
      .outputOptions(`-vcodec libwebp`)
      .outputOptions(`-vf fps=${FRAMERATE},scale=${WIDTH}:${HEIGHT}`)
      // .outputOptions(`-preset default`)
      .outputOptions(`-loop 0`)
      .outputOptions(`-vsync 0`)
      .outputOptions(`-qscale ${QUALITY}`)
      .on('start', function (commandLine) {
        l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        l(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}/thing.webp`);
  })
}


/**
 *
 * @param path
 * @param fps
 * @param size
 * @param outputFolder
 * @returns {Promise<unknown>}
 */
async function trimFile(
  {
    path, outputFolder
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(path)
      .outputOptions(`-vcodec libx264`)
      .outputOptions(`-an`)
      .outputOptions(`-t ${AMOUNT_OF_SECONDS}`)
      .outputOptions(`-ss ${STARTING_SECONDS}`)
      .on('start', function (commandLine) {
        l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        l(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}/thing.mp4`);
  })
}

/**
 *
 * @param path
 * @param fps
 * @param size
 * @param outputFolder
 * @returns {Promise<unknown>}
 */
async function speedUpFile(
  {
    path, outputFolder
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(path)
      .outputOptions(`-vf setpts=0.5*PTS`)
      .on('start', function (commandLine) {
        l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        l(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}/thing1.mp4`);
  })
}


// module.exports = generateHoverPreviewThumbnail;
