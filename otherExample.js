const generateVideoScreenshots = require('./generateVideoScreenshots');
const createSpriteImage = require('./joinImages');
const fs = require('fs');

const columns = 9;
const extraweltPath = './videos/extrawelt.mp4';
const fps = 1/2; // if the current API is 'every x seconds', then it's 1/x
const size = '140x79'; // width x height
const outputFolder = './output1' // TODO: make this if it doesn't exist yet with fs-extra

async function generateSpriteImage(){
  try {
    const screenshotImagesFolder = `${outputFolder}/screenshotImages`;
    fs.mkdirSync(screenshotImagesFolder, { recursive: true });

    const response = await generateVideoScreenshots({
      path: extraweltPath,
      fps,
      size,
      outputFolder: screenshotImagesFolder
    })

    console.log(response);

    const spriteResponse = await createSpriteImage({ columns, existingPath: outputFolder })

    console.log(spriteResponse);
  } catch (err){
    console.log(err)
  }
}

export default generateSpriteImage;
