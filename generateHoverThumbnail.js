const ffmpeg = require('fluent-ffmpeg');
const which = require('which')
const path = require('path')
const ffprobe = require("ffprobe");
const fs = require("fs-extra");

let l = console.log;

const getExt = path.extname;

const ffprobePath = which.sync('ffprobe')

// TODO: algorithm, 1/4 the way in , 5 seconds at 2x speed
const FRAMERATE = 6;
const WIDTH = 320;
const HEIGHT = 180;
// Set compression of webp images between 1-100 with 100 being perfect.
const QUALITY = 70;
const AMOUNT_OF_SECONDS = 5;
const STARTING_SECONDS = 20; // TODO: replace with length getting algorithm

async function generateHoverThumbnail({ inputFilePath, outputFolder, filename, debug }){
  if(!debug) l = function(){};

  try {
    const fileExtension = getExt(inputFilePath);

    const ffprobeResponse = await ffprobe(inputFilePath, { path: ffprobePath });

    const videoStream = ffprobeResponse.streams.filter(stream => stream.codec_type === 'video')[0];

    const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

    l(videoDurationInSeconds);

    const trimmedFilePath = `${outputFolder}/${filename}-trimmed${fileExtension}`;

    await trimFile({
      inputFilePath,
      outputFilePath: trimmedFilePath,
    })

    const spedUpFilePath = `${outputFolder}/${filename}-sped-up${fileExtension}`;

    await speedUpFile({
      inputFilePath: trimmedFilePath,
      outputFilePath: spedUpFilePath,
    })

    const hoverThumbnailFilePath = `${outputFolder}/${filename}.webp`;

    await generateHoverPreviewThumbnail({
      inputFilePath: spedUpFilePath,
      outputFilePath: hoverThumbnailFilePath,
    })

    if(!debug){
      fs.remove(spedUpFilePath);
      fs.remove(trimmedFilePath)
    }
  } catch (err){
    l(err)
    throw new Error(err);
  }
}

/**
 *
 * @param inputFilePath
 * @param outputFilePath
 * @returns {Promise<unknown>}
 */
async function trimFile(
  {
    inputFilePath, outputFilePath
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(inputFilePath)
      .outputOptions(`-vcodec libx264`)
      .outputOptions(`-an`)
      .outputOptions(`-ss ${STARTING_SECONDS}`) // where to start the trim
      .outputOptions(`-t ${AMOUNT_OF_SECONDS}`) // should always be 5 seconds trimmed
      .on('start', function (commandLine) {
        l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        l(`PROGRESS: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(outputFilePath);
  })
}

/**
 *
 * @param inputFilePath
 * @param outputFilePath
 * @returns {Promise<unknown>}
 */
async function speedUpFile(
  {
    inputFilePath, outputFilePath
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(inputFilePath)
      .outputOptions(`-vf setpts=0.5*PTS`) // speeds up 2x speed
      .on('start', function (commandLine) {
        l('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        l(`PROGRESS: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(outputFilePath);
  })
}

/**
 *
 * @param inputFilePath
 * @param outputFilePath
 * @returns {Promise<unknown>}
 */
async function generateHoverPreviewThumbnail(
  {
    inputFilePath, outputFilePath
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(inputFilePath)
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
        l(`PROGRESS: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {
        l('Processing finished !');
        resolve('success');

      }).save(outputFilePath);
  })
}

module.exports = generateHoverThumbnail

