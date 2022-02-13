const { getVideoDurationInSeconds } = require('get-video-duration')
const ffprobe = require('ffprobe');
const Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;
ffprobeStatic = require('ffprobe-static');
const clipThumbnail = require('./clip');

process.on('unhandledRejection', console.log)

function getImageNumberFromRow(row, mappingArray){
  for(const imageItem of mappingArray) {
    const { startingRow, finishingRow, imageNumber, amountOfRowsPerSplit } = imageItem

    if(row >= startingRow && row <= finishingRow){
      return {
        imageNumber,
        amountOfRowsPerSplit
      }
    }
  }
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
function createVTT({
  videoDurationInSeconds,
  height,
  width,
  columns,
  spriteOutputFilePath,
  outputFile,
  prependPath,
  filename,
  spriteFileName,
  intervalInSecondsAsInteger,
  mappingArray
}){
  const v = new Vtt();

  // this actually maps to 'amount of thumbnails'
  // create an array from 1 to the duration in seconds (ie 30)
  const createdArray = Array.from({length: (videoDurationInSeconds/intervalInSecondsAsInteger)}, (_, i) => i + 1)

  // loop through the array of thumbnails
  for(const thumbnailNumber of createdArray){
    // figure out what row the thumbnail will be on, so 1/5 = 0.2, round to 1, it's row 1
    const row = Math.ceil(thumbnailNumber/columns)


    // modulus (remainder operator), so if thumbnail number is 6, and columns is 5, remainder is 1 and thus column is 1?
    let column = thumbnailNumber % columns
    // if there's no remainder, it means you are at the end of the columns aka (5 % 5 = 0), so put add 5 to put it as the value
    if(column === 0) column = column + columns
    // x value is the column number times the width, but then move over one full column width to start at the left
    const xValue = ( column * width ) - width

    const { imageNumber, amountOfRowsPerSplit }  = getImageNumberFromRow(row, mappingArray);

    // 1-9 row unadjusted

    // 10-18 row - 9


    const adjustedRow = row - (( imageNumber - 1 ) * amountOfRowsPerSplit)

    const yValue = (adjustedRow * height ) - height

    const filePathToUse = `${filename}-${imageNumber}`

    // add line to webvtt file (why thumbnailNumber -1 as first param?)
    // starts as 0 because that's the first second (0 seconds)
    v.add((thumbnailNumber * intervalInSecondsAsInteger) - intervalInSecondsAsInteger, thumbnailNumber * intervalInSecondsAsInteger,`${prependPath}/${filePathToUse}.webp#xywh=${xValue},${yValue},${width},${height}`);
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

  // build arguments array to be plugged into generator via spawn
  let argumentsArray = [];

  argumentsArray[0] = inputFilePath
  argumentsArray[1] = intervalInSecondsAsInteger
  argumentsArray[2] = width
  argumentsArray[3] = height
  argumentsArray[4] = columns;
  argumentsArray[5] = outputFilePath;

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
async function createSpriteAndThumbnails({
  pathToGenerator,
  inputFile,
  intervalInSecondsAsInteger,
  widthInPixels,
  heightInPixels,
  columns,
  spriteOutputFilePath,
  webVTTOutputFilePath,
  prependPath,
  filename,
  spriteFileName
}){
  try {

    // TODO: get from ffmpeg (Math.ceil)
    const ffprobe1 = await ffprobe(inputFile, { path: ffprobeStatic.path });
    // console.log(ffprobe1);

    let videoStream;
    for(const stream of ffprobe1.streams){
      if(stream.codec_type === 'video'){
        videoStream = stream
      }
    }

    const aspectRatio = videoStream.display_aspect_ratio
    const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

    console.log(videoStream);

    // used in the calculations to determine what to show when
    // const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds(inputFile));

    console.log(videoDurationInSeconds);

    /** create image sprite as .png **/
    const response = await createSprite({
      pathToGenerator,
      intervalInSecondsAsInteger,
      inputFilePath: inputFile,
      height: heightInPixels,
      width: widthInPixels,
      columns,
      outputFilePath: spriteOutputFilePath,
      filename
    });

    const spriteFileSizeInKb = ((await fs.promises.stat(spriteOutputFilePath)).size/1000)

    const amountOfThumbnails = Math.ceil(videoDurationInSeconds / intervalInSecondsAsInteger);

    const amountOfRows = Math.ceil(amountOfThumbnails / columns);

    const targetSizeInKb = 80;

    console.log(amountOfRows);
    console.log(amountOfThumbnails);

    /** clip thumbnails into smaller chunks **/
    const mappingArray = clipThumbnail({
      columns,
      rows: amountOfRows,
      fullThumbnailPath: spriteOutputFilePath,
      imageWidth: widthInPixels,
      imageHeight: heightInPixels,
      totalFileSize: spriteFileSizeInKb,
      targetFileSize: targetSizeInKb,
      filename
    })

    /** create vtt file with mappings **/
      // this is sync so doesn't need to be awaited
    const cttResponse = createVTT({
        videoDurationInSeconds,
        intervalInSecondsAsInteger,
        height: heightInPixels,
        width: widthInPixels,
        columns,
        spriteOutputFilePath,
        outputFile: webVTTOutputFilePath,
        prependPath,
        filename,
        spriteFileName,
        mappingArray
      })
    console.log(cttResponse)

  } catch (err){
    console.log(err);
  }
}

module.exports = createSpriteAndThumbnails
