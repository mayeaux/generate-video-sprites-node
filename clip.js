const sharp = require("sharp");
const sizeOf = require('image-size')

async function clipSpriteThumbnail({
   fullThumbnailPath,
   rows,
   columns,
   imageWidth,
   imageHeight,
   totalFileSize,
   targetFileSize,
   filename,
   extract = true,
   debug = false,
   outputFolder
}){

  if(!debug){
    const c = {
      l : undefined
    }
  }

  // load sharp
  const image = sharp(fullThumbnailPath);
  c.l('image width, image height');
  c.l(imageWidth, imageHeight);

  const dimensions = sizeOf(fullThumbnailPath);
  c.l('Image size:')
  c.l(dimensions)

  // width of thumbnail is column times image width
  const totalWidth = columns * imageWidth;
  c.l('Calculated width:')
  c.l(totalWidth);

  const imagesWithRows = [];

  c.l('totalFileSize, targetFileSize');
  c.l(totalFileSize, targetFileSize)

  // no need to compress
  if(targetFileSize > totalFileSize) return

  // rough estimate of how many times to split by total size divided by target
  const howManySplits = Math.floor(totalFileSize/targetFileSize);

  c.l('rows, howManyImages')
  c.l(rows, howManySplits);

  // how many rows that should happen per file
  const amountOfRowsPerSplit = Math.floor(rows/howManySplits);

  c.l('amountOfRowsPerImage rows/howManySplits');
  c.l(amountOfRowsPerSplit);

  const remainder = rows - (amountOfRowsPerSplit * howManySplits)
  c.l('remainder');
  c.l(remainder);

  // create an array for each split
  const createdArray = Array.from({length: (howManySplits)}, (_, i) => i + 1)

  c.l('createdArray for looping')
  c.l(createdArray)
  for(const [index, value] of createdArray.entries()){
    c.l('value');
    c.l(value);

    // how many rows per image (remainder will be added)
    let amountOfRowsToHit = amountOfRowsPerSplit;

    c.l('rows, # of rows to hit')
    c.l(rows, amountOfRowsToHit);

    // really should be renamed 'starting row'
    const topPosition = (value - 1) * amountOfRowsToHit

    c.l('starting row');
    const startingRow = topPosition + 1
    c.l(startingRow)

    // add remainder to final clip
    if(value == createdArray.length){
      amountOfRowsToHit = amountOfRowsToHit + remainder
    }

    c.l('finishing row');
    const finishingRow = topPosition + amountOfRowsToHit
    c.l(finishingRow);

    const thingObject = {
      startingRow, finishingRow, imageNumber: value, amountOfRowsPerSplit
    }

    imagesWithRows.push(thingObject);

    let finalHeight;
    if(value === createdArray.length) {
      console.log('LAST ONE!');
      c.l('dimensons');
      c.l(dimensions.width, dimensions.height)
      const startingHeight =  (startingRow - 1) * imageHeight;
      c.l('starting height');
      c.l(startingHeight)
      finalHeight = dimensions.height - startingHeight;
      c.l('final height');
      c.l(finalHeight)
    }

    // load details
    const splitObject = {
      left: 0,
      top: topPosition * imageHeight,
      width: totalWidth,
      height: finalHeight || amountOfRowsToHit * imageHeight,
    }

    c.l('split object')
    c.l(splitObject)

    // return response
    // create split
    if(extract){
      await image
        .extract(splitObject)
        .toFile(`${outputFolder}/${filename}-${value}.webp`)

    }
  }

  return imagesWithRows

}

module.exports = clipSpriteThumbnail
