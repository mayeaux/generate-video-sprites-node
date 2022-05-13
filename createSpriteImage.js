const generateVideoScreenshots = require('./generateVideoScreenshots');
const joinImages = require('./joinImages');
const fs = require('fs-extra');

async function generateSpriteImage(
  {
    columns,
    videoPath,
    screenshotIntervalInSeconds,
    sizeAsWidthxHeight,
    outputFolder,
    spriteOutputFilePath,
    debug
  }){
  try {
    const screenshotImagesFolder = `${outputFolder}/screenshotImages`;
    fs.mkdirSync(screenshotImagesFolder, { recursive: true });
    fs.emptyDirSync(screenshotImagesFolder)

    // use ffmpeg to take all the screenshot images
    const response = await generateVideoScreenshots({
      path: videoPath,
      fps: (1 / screenshotIntervalInSeconds),
      size: sizeAsWidthxHeight,
      outputFolder: screenshotImagesFolder,
      debug
    })

    c.l(response);

    // do a horizontal and then vertical join
    const spriteResponse = await joinImages({
      columns,
      outputPath: outputFolder,
      spriteOutputFilePath,
      debug
    })

    c.l(spriteResponse);

    return 'success'
  } catch (err){
    console.log(err)
  }
}

module.exports = generateSpriteImage;
