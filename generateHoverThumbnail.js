const ffmpeg = require('fluent-ffmpeg');
const which = require('which')
const path = require('path')
const ffprobe = require("ffprobe");
const fs = require("fs-extra");

let l = console.log;

const getExt = path.extname;

const ffprobePath = which.sync('ffprobe')

/** default values **/
// haven't fully massaged these, but generally should be OK quality at ~100-150kb
const QUALITY = 70; // Set compression of webp images between 1-100 with 100 being perfect.
const FRAMERATE = 6;
const WIDTH = 320;
const HEIGHT = 180;

async function generateHoverThumbnail({
  inputFilePath,
  outputFolder,
  filename,
  quality,
  framerate,
  width,
  height,
  debug
}){
  if(!debug) l = function(){};

  try {
    const fileExtension = getExt(inputFilePath);

    const ffprobeResponse = await ffprobe(inputFilePath, { path: ffprobePath });

    const videoStream = ffprobeResponse.streams.filter(stream => stream.codec_type === 'video')[0];

    const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

    l(`Video duration in seconds: ${videoDurationInSeconds}`);

    const { timeToTrimInSeconds, startingTimeInSeconds } = determineStartingTimeAndSeconds(videoDurationInSeconds);

    l(`timeToTrimInSeconds: ${timeToTrimInSeconds}`);

    l(`startingTimeInSeconds: ${startingTimeInSeconds}`);

    const trimmedFilePath = `${outputFolder}/${filename}-trimmed${fileExtension}`;

    await trimFile({
      inputFilePath,
      outputFilePath: trimmedFilePath,
      timeToTrimInSeconds,
      startingTimeInSeconds
    })

    const spedUpFilePath = `${outputFolder}/${filename}-sped-up${fileExtension}`;

    await speedUpFile({
      inputFilePath: trimmedFilePath,
      outputFilePath: spedUpFilePath,
    })

    // load from the defaults if not received from the cli
    quality = quality || QUALITY;
    framerate = framerate || FRAMERATE;
    width = width || WIDTH;
    height = height || HEIGHT;

    l(`quality: ${quality}`);
    l(`framerate: ${framerate}`);
    l(`width: ${width}`);
    l(`height: ${height}`);

    const hoverThumbnailFilePath = `${outputFolder}/${filename}.webp`;

    await generateHoverPreviewThumbnail({
      inputFilePath: spedUpFilePath,
      outputFilePath: hoverThumbnailFilePath,
      quality,
      framerate,
      width,
      height,
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

function determineStartingTimeAndSeconds(videoLengthInSeconds){
  let startingTimeInSeconds, timeToTrimInSeconds;
  if(videoLengthInSeconds <= 5){
    startingTimeInSeconds = 0;
    timeToTrimInSeconds = videoLengthInSeconds
  } else {
    startingTimeInSeconds = Math.floor(videoLengthInSeconds / 4);
    timeToTrimInSeconds = 5;
  }

  return {
    startingTimeInSeconds,
    timeToTrimInSeconds
  }
}

/**
 *
 * @param inputFilePath
 * @param outputFilePath
 * @param timeToTrimInSeconds
 * @param startingTimeInSeconds
 * @returns {Promise<unknown>}
 */
async function trimFile(
  {
    inputFilePath, outputFilePath, timeToTrimInSeconds, startingTimeInSeconds
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(inputFilePath)
      .outputOptions(`-vcodec libx264`)
      .outputOptions(`-an`)
      .outputOptions(`-ss ${startingTimeInSeconds}`) // where to start the trim
      .outputOptions(`-t ${timeToTrimInSeconds}`) // should always be 5 seconds trimmed
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
 * @param quality
 * @param framerate
 * @param height
 * @param width
 * @returns {Promise<unknown>}
 */
async function generateHoverPreviewThumbnail(
  {
    inputFilePath, outputFilePath, quality, framerate, height, width
  }
){
  return new Promise(function (resolve, reject) {
    ffmpeg(inputFilePath)
      .outputOptions(`-vcodec libwebp`)
      .outputOptions(`-vf fps=${framerate},scale=${width}:${height}`)
      // .outputOptions(`-preset default`)
      .outputOptions(`-loop 0`)
      .outputOptions(`-vsync 0`)
      .outputOptions(`-qscale ${quality}`)
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

