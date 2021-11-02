const { getVideoDurationInSeconds } = require('get-video-duration')
const Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;
const probe = require('node-ffprobe');

process.on('unhandledRejection', console.log)

function ffprobePromise(filePath) {
  // 1 - Create a new Promise
  return new Promise(function (resolve, reject) {
    // 2 - Copy-paste your code inside this function
    probe(filePath, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


/**
 * Creates a VTT file given an amount of seconds, width, height, columns. Written to an out path.
 * @param videoDurationInSeconds
 * @param height
 * @param width
 * @param columns
 * @param spriteOutputFilePath
 * @param outputFile
 * @returns {string}
 */
function createVTT({ videoDurationInSeconds, height, width, columns, spriteOutputFilePath, outputFile, prependPath, filename, spriteFileName }){
  const v = new Vtt();

  const createdArray = Array.from({length: videoDurationInSeconds}, (_, i) => i + 1)

  for(const thumbnailNumber of createdArray){
    const row = Math.ceil(thumbnailNumber/columns)
    let column = thumbnailNumber % columns
    if(column === 0) column = column + columns
    const xValue = ( column * width ) - width
    const yValue = ( row * height ) - height

    // TODO: turn thumbnailNumber into seconds, right now it's hardcoded expecting 1 thumbnail per second
    // TODO: this path is broken
    // add line to webvtt file
    v.add(thumbnailNumber - 1, thumbnailNumber,`${prependPath}/${spriteFileName}#xywh=${xValue},${yValue},${width},${height}`);
  }

  fs.writeFileSync(outputFile, v.toString());

  return 'completed'

}

/**
 * Takes a video and outputs a sprite image when below parameters are defined
 * @param pathToGenerator
 * @param inputFilePath
 * @param width - in pixels
 * @param height - in pixels
 * @param intervalInSeconds
 * @param columns
 * @param outputFilePath
 * @returns {Promise<string>}
 */
async function createSprite({pathToGenerator, intervalInSecondsAsInteger, inputFilePath, width, height, columns, outputFilePath }) {

  // arguments array for the generator
  let argumentsArray = [];
  argumentsArray[0] = inputFilePath
  argumentsArray[1] = intervalInSecondsAsInteger
  argumentsArray[2] = width
  argumentsArray[3] = height
  argumentsArray[4] = columns;
  argumentsArray[5] = outputFilePath;

  console.log(argumentsArray);

  const child = spawn(pathToGenerator, argumentsArray);

  let data = "";
  // TODO: check for error here
  for await (const chunk of child.stdout) {
    console.log('stdout chunk: '+chunk);
    data += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    console.error('stderr chunk: '+chunk);
    error += chunk;
  }
  const exitCode = await new Promise( (resolve, reject) => {
    child.on('close', resolve);
  });

  if( exitCode) {
    throw new Error( `subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

/**
 * Main exported function that is used to compile the sprite/webvtt
 * @param inputFile - path to the video to have sprites/webvtt created from
 * @param intervalInSecondsAsInteger
 * @param widthInPixels
 * @param heightInPixels
 * @param columns
 * @param spriteOutputFilePath
 * @param webVTTOutputFilePath
 * @returns {Promise<void>}
 */
async function createSpriteAndThumbnails({pathToGenerator, inputFile, intervalInSecondsAsInteger, heightInPixels, columns, spriteOutputFilePath, webVTTOutputFilePath, prependPath, filename, spriteFileName }){
  try {

    // used in the calculations to determine what to show when
    const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds(inputFile));

    const ffprobeData = await ffprobePromise(inputFile);

    let videoStream;
    for(const stream of ffprobeData.streams){
      if(stream.codec_type === 'video'){
        videoStream = stream;
      }
    }

    const aspectRatio = videoStream.display_aspect_ratio;

    // given the height, what is the width?
    // aspect ratio is width:height
    // therefore, if the height is 200, and the aspect ratio is 2:1, the width will be 400
    function getWidthFromHeightGivenAspectRatioString(height, aspectRatio){
      const ratioValues = aspectRatio.split(':');
      const widthRatio = ratioValues[0];
      const heightRatio = ratioValues[1];
      const ratioMultiplier = Number(widthRatio)/Number(heightRatio);
      const width = ratioMultiplier * Number(heightInPixels);
      // rounding because otherwise it was throwing errors
      return Math.round(width);
    }

    const widthInPixels = getWidthFromHeightGivenAspectRatioString(heightInPixels, aspectRatio);

    // create vtt file with mappings
    // this is sync so doesn't need to be awaited
    const cttResponse = createVTT({ videoDurationInSeconds, intervalInSecondsAsInteger, height: heightInPixels, width: widthInPixels, columns, spriteOutputFilePath, outputFile: webVTTOutputFilePath, prependPath, filename, spriteFileName })
    console.log(cttResponse)

    // create image sprite as .png
    const response = await createSprite({ pathToGenerator, intervalInSecondsAsInteger, inputFilePath: inputFile, height: heightInPixels, width: widthInPixels, columns, outputFilePath: spriteOutputFilePath });
    console.log(response)

  } catch (err){
    console.log(err);
  }
}

module.exports = createSpriteAndThumbnails
