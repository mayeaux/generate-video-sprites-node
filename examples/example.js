const createSpriteWithVTT = require('../index')

const fileName = 'example'

const inputFile = `./examples/${fileName}.mp4`;
const intervalInSecondsAsInteger = 1;
const widthInPixels = 300;
const heightInPixels = 169;
const columns = 5;
const spriteOutputFilePath = `./output/${fileName}.png`;
const webVTTOutputPath = `./output/${fileName}.vtt`;

createSpriteWithVTT({ inputFile, intervalInSecondsAsInteger, widthInPixels, heightInPixels, columns, spriteOutputFilePath, webVTTOutputPath })

