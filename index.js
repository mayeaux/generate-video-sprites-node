const ffprobe = require('ffprobe');
const Vtt = require('vtt-creator');
const fs = require('fs');
ffprobeStatic = require('ffprobe-static');
const clipThumbnail = require('./clip');
const sizeOf = require('image-size')
const createSpriteImage = require('./createSpriteImage');
require('./logging');

function getImageNumberFromRow(mappingArray, row){
  // loop through all the thumbnail items in the array
  for(const imageItem of mappingArray) {
    //
    const { startingRow, finishingRow, imageNumber, amountOfRowsPerSplit } = imageItem

    if(row >= startingRow && row <= finishingRow){
      return {
        imageNumber,
        amountOfRowsPerSplit
      }
    } else {
      // c.l(startingRow, finishingRow, row, imageNumber, amountOfRowsPerSplit)
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

  c.l('mapping array')
  c.l(mappingArray);

  // this actually maps to 'amount of thumbnails'
  // create an array from 1 to the duration in seconds (ie 30)
  const createdArray = Array.from({length: (videoDurationInSeconds/intervalInSecondsAsInteger)}, (_, i) => i + 1)

  c.l(createdArray.length);

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

    c.l(row);

    // based on which row is passed, know which image to point towards
    const { imageNumber, amountOfRowsPerSplit }  = getImageNumberFromRow(mappingArray, row);

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

// /**
//  * Main exported function that is used to compile the sprite/webvtt
//  * @param inputFilePath - path to the video to have sprites/webvtt created from
//  * @param intervalInSecondsAsInteger
//  * @param widthInPixels
//  * @param heightInPixels
//  * @param columns
//  * @param spriteOutputFilePath
//  * @param webVTTOutputFilePath
//  * @returns {Promise<void>}
//  */
async function createSpriteAndThumbnails({
  inputFilePath,
  intervalInSecondsAsInteger,
  widthInPixels,
  heightInPixels,
  columns,
  spriteOutputFilePath,
  webVTTOutputFilePath,
  prependPath,
  filename,
  spriteFileName,
  debug = false,
  thumbnailLongestSide,
  targetSizeInKb,
  outputFileDirectory
}){
  try {

    if(!debug){
      global.c = {
        l : function(){}
      };
    }

    const ffprobe1 = await ffprobe(inputFilePath, { path: ffprobeStatic.path });

    let videoStream;
    for(const stream of ffprobe1.streams){
      if(stream.codec_type === 'video'){
        videoStream = stream
      }
    }

    let verticalVideo = videoStream.width < videoStream.height;

    let aspectRatio = videoStream.width / videoStream.height;
    if (verticalVideo){
      aspectRatio = videoStream.height / videoStream.width;
    }

    const multiply = thumbnailLongestSide / aspectRatio;
    c.l('aspect ratio');
    c.l(aspectRatio);

    c.l('multiply');
    c.l(multiply);

    let imageWidth = aspectRatio * multiply
    let imageHeight = imageWidth / aspectRatio;
    if(verticalVideo){
      imageHeight = aspectRatio * multiply
      imageWidth = imageHeight / aspectRatio;
    }

    c.l('image height, image width');
    c.l(imageHeight, imageWidth);

    widthInPixels = Math.round(imageWidth);
    heightInPixels = Math.round(imageHeight);

    const sizeAsWidthxHeight = `${widthInPixels}x${heightInPixels}`;

    const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

    c.l(videoStream);

    c.l(videoDurationInSeconds);

    const response = await createSpriteImage({
      columns,
      videoPath: inputFilePath,
      screenshotIntervalInSeconds: intervalInSecondsAsInteger,
      sizeAsWidthxHeight,
      outputFolder: `${outputFileDirectory}/processing`,
      spriteOutputFilePath,
      debug
    })

    console.log(`Sprite image creation: ${response}`)

    const spriteFileSizeInKb = ((await fs.promises.stat(spriteOutputFilePath)).size/1000)

    const amountOfThumbnails = Math.ceil(videoDurationInSeconds / intervalInSecondsAsInteger);
    c.l('amount of thumbnails');
    c.l(amountOfThumbnails);

    c.l('amount of columns');
    c.l(columns)

    const dimensions = sizeOf(spriteOutputFilePath);
    c.l('Image size:')
    c.l(dimensions)

    const amountOfRows = dimensions.height / heightInPixels
    c.l('amount of rows');
    c.l(amountOfRows);

    /** clip thumbnails into smaller chunks **/
    const mappingArray = await clipThumbnail({
      columns,
      rows: amountOfRows,
      fullThumbnailPath: spriteOutputFilePath,
      imageWidth: widthInPixels,
      imageHeight: heightInPixels,
      totalFileSize: spriteFileSizeInKb,
      targetFileSize: targetSizeInKb,
      filename,
      debug,
      outputFolder: outputFileDirectory
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
        mappingArray,
      })

    c.l(cttResponse)

  } catch (err){
    c.l(err);
  }
}

module.exports = createSpriteAndThumbnails
