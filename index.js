const ffprobe = require('ffprobe');
const fs = require('fs-extra');
ffprobeStatic = require('ffprobe-static');
const clipThumbnail = require('./clip');
const createSpriteImage = require('./createSpriteImage');
const createVTT = require('./createVtt');
require('./logging');

function determineThumbnailWidthAndHeight(video, thumbnailLongestSide){
  let verticalVideo = video.width < video.height;

  let aspectRatio = video.width / video.height;
  if (verticalVideo){
    aspectRatio = video.height / video.width;
  }

  const multiply = thumbnailLongestSide / aspectRatio;
  c.l(`aspect ratio: ${aspectRatio}`);
  c.l(`multiply: ${multiply}`);

  let imageWidth = aspectRatio * multiply
  let imageHeight = imageWidth / aspectRatio;
  if(verticalVideo){
    imageHeight = aspectRatio * multiply
    imageWidth = imageHeight / aspectRatio;
  }

  c.l(`image height: ${imageHeight}, image width: ${imageWidth}`);

  const widthInPixels = Math.round(imageWidth);
  const heightInPixels = Math.round(imageHeight);

  return {
    heightInPixels, widthInPixels
  }
}

/**
 * Main exported function that is used to compile the sprite/webvtt
 * @param inputFilePath
 * @param intervalInSecondsAsInteger
 * @param widthInPixels
 * @param heightInPixels
 * @param columns
 * @param spriteOutputFilePath
 * @param webVTTOutputFilePath
 * @param prependPath
 * @param filename
 * @param spriteFileName
 * @param debug
 * @param thumbnailLongestSide
 * @param targetSizeInKb
 * @param outputFileDirectory
 * @returns {Promise<void>}
 */
async function createSpriteAndThumbnails({
  inputFilePath,
  intervalInSecondsAsInteger,
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

    const ffprobeResponse = await ffprobe(inputFilePath, { path: ffprobeStatic.path });

    const videoStream = ffprobeResponse.streams.filter(stream => stream.codec_type === 'video')[0];

    const { widthInPixels, heightInPixels } = determineThumbnailWidthAndHeight(videoStream, thumbnailLongestSide);

    const sizeAsWidthxHeight = `${widthInPixels}x${heightInPixels}`;

    const videoDurationInSeconds = Math.ceil(Number(videoStream.duration));

    c.l(videoStream);

    c.l(videoDurationInSeconds);

    const averageRowSizeInKb = await createSpriteImage({
      columns,
      videoPath: inputFilePath,
      screenshotIntervalInSeconds: intervalInSecondsAsInteger,
      sizeAsWidthxHeight,
      outputFolder: `${outputFileDirectory}/processing`,
      spriteOutputFilePath,
      debug
    })

    c.l(`Sprite image creation: ${averageRowSizeInKb}`)

    const horizontalImagesDirectory = `${outputFileDirectory}/processing/horizontalImages`;

    let amountOfFiles = fs.readdirSync(horizontalImagesDirectory)
      .filter( function( elm ) {return elm.match(/.*\.(webp?)/ig);})
      .length;


    /** clip thumbnails into smaller chunks **/
    const mappingArray = await clipThumbnail({
      columns,
      rows: amountOfFiles,
      fullThumbnailPath: spriteOutputFilePath,
      imageWidth: widthInPixels,
      imageHeight: heightInPixels,
      targetFileSize: targetSizeInKb,
      filename,
      debug,
      outputFolder: outputFileDirectory,
      averageRowSizeInKb,
      outputFileDirectory
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

    if(!debug){
      fs.remove(spriteOutputFilePath);
      fs.remove(`${outputFileDirectory}/processing`)
    }

  } catch (err){
    c.l(err);
    throw new Error(err);
  }
}

module.exports = createSpriteAndThumbnails
