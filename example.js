const createSpriteWithVTT = require('./index')

const inputFile = './example.mp4';
const intervalInSecondsAsInteger = 1;
const widthInPixels = 300;
const heightInPixels = 200;
const columns = 10;
const spriteOutputFilePath = './example.png';
const webVTTOutputPath = './example.webvtt';

createSpriteWithVTT({ inputFile, intervalInSecondsAsInteger, widthInPixels, heightInPixels, columns, spriteOutputFilePath, webVTTOutputPath })

