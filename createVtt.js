const fs = require("fs");
const webvtt = require("node-webvtt");

function getImageNumberFromRow(mappingArray, row){
  // loop through all the thumbnail items in the array
  for(const imageItem of mappingArray) {

    const { startingRow, finishingRow, imageNumber, amountOfRows } = imageItem

    // get the matching information for that row
    if(row >= startingRow && row <= finishingRow){
      return {
        imageNumber,
        amountOfRowsPerSplit: amountOfRows,
        startingRow,
        finishingRow
      }
    }
  }
}

/**
 * Creates a VTT file given an amount of seconds, width, height, columns. Written to an out path
 * @param videoDurationInSeconds
 * @param height
 * @param width
 * @param columns
 * @param outputFile
 * @param prependPath
 * @param filename
 * @param spriteFileName
 * @param intervalInSecondsAsInteger
 * @param mappingArray
 * @returns {string}
 */
function createVTT({
  videoDurationInSeconds,
  height,
  width,
  columns,
  outputFile,
  prependPath,
  filename,
  spriteFileName,
  intervalInSecondsAsInteger,
  mappingArray
}){

  c.l('mapping array')
  c.l(mappingArray);

  // this actually maps to 'amount of thumbnails'
  // create an array from 1 to the duration in seconds (ie 30)
  const createdArray = Array.from({ length: (videoDurationInSeconds/intervalInSecondsAsInteger)}, (_, i) => i + 1)

  c.l(createdArray.length);

  let cues = [];

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

    // c.l('row')
    // c.l(row);

    // based on which row is passed, know which image to point towards
    const { startingRow, finishingRow, imageNumber, amountOfRowsPerSplit }  = getImageNumberFromRow(mappingArray, row);

    // c.l(imageNumber, amountOfRowsPerSplit)

    // how many pixels to move downwards
    const yValue = (finishingRow - startingRow) * height

    // c.l(yValue);

    const filePathToUse = `${filename}-${imageNumber}`

    // starting seconds number
    const startingNumber = (thumbnailNumber * intervalInSecondsAsInteger) - intervalInSecondsAsInteger;
    // ending seconds number
    const endingNumber = thumbnailNumber * intervalInSecondsAsInteger;

    // where to point to on the image
    const text = `${prependPath}/${filePathToUse}.webp#xywh=${xValue},${yValue},${width},${height}`

    let lineObject = {
      start: startingNumber,
      end: endingNumber,
      text,
      // not used
      identifier: '',
      styles: ''
    }

    // add line to webvtt file (why thumbnailNumber -1 as first param?)
    // starts as 0 because that's the first second (0 seconds)
    cues.push(lineObject);
  }

  const input = {
    cues,
    valid: true
  };

  const compiledWebVTT = webvtt.compile(input);

  fs.writeFileSync(outputFile, compiledWebVTT);

  return 'completed'

}

module.exports = createVTT;
