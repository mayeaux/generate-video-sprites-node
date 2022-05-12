const ffprobe = require('ffprobe');
const fs = require('fs');
ffprobeStatic = require('ffprobe-static');
const clipThumbnail = require('./clip');
const sizeOf = require('image-size')
const createSpriteImage = require('./createSpriteImage');
const createVTT = require('./createVtt');
require('./logging');

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

    c.l(`Sprite image creation: ${response}`)

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
