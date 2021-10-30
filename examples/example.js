const createSpriteWithVTT = require('../index')
/** input and output paths **/
// used in the paths, could use different names if you want
const filename = 'macdonald'

// the file to create sprite and vtt from
const inputFile = `./videos/${filename}.mp4`;

// where to output the files
const spriteOutputFilePath = `./output/${filename}.png`;
const webVTTOutputFilePath = `./output/${filename}.vtt`;

// used in building the path for sprite prepend
// (aka where the sprite image will be served from)
const prependPath = '/uploads/anthony'

/**  variables to setup the output of the sprite/vtt **/
// how often should a snapshot be taken
const intervalInSecondsAsInteger = 1;

// size of the hover image
const widthInPixels = 300;
const heightInPixels = 169;

// how many columns to use, seems arbitrary so I'll use 5
const columns = 5;

createSpriteWithVTT({ inputFile, intervalInSecondsAsInteger, widthInPixels, heightInPixels, columns, spriteOutputFilePath, webVTTOutputFilePath, prependPath, filename })

