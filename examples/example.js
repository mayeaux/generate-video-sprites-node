const createSpriteWithVTT = require('../index')

const filename = 'newVideoTrimmed'

const inputFile = `./videos/${filename}.mp4`;
const intervalInSecondsAsInteger = 1;
const widthInPixels = 300;
const heightInPixels = 169;
const columns = 5;
const spriteOutputFilePath = `./output/${filename}.png`;
const webVTTOutputFilePath = `./output/${filename}.vtt`;
const prependPath = '/uploads/anthony'

createSpriteWithVTT({ inputFile, intervalInSecondsAsInteger, widthInPixels, heightInPixels, columns, spriteOutputFilePath, webVTTOutputFilePath, prependPath, filename })

