const sharp = require("sharp");
const sizeOf = require('image-size')

let distributeInteger = function* (total, divider) {
  if (divider === 0) {
    yield 0
  } else {
    let rest = total % divider
    let result = total / divider

    for (let i = 0; i < divider; i++) {
      if (rest-- >0) {
        yield Math.ceil(result)
      } else {
        yield Math.floor(result)
      }
    }
  }
}


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

  // used for creating the webvtt
  const imagesWithRows = [];

  // no need to compress
  // cant skip because this is also used for webvtt
  // if(targetFileSize > totalFileSize) return

  const webpFileSizeEquivalent = Math.round(totalFileSize - (totalFileSize * 0.3));

  c.l('totalFileSize, targetFileSize, webpFileSizeEquivalent');
  c.l(totalFileSize, targetFileSize, webpFileSizeEquivalent);

  // rough estimate of how many images are needed with total size / target
  let howManyImages;

  // this is actually a bug, it should be Math.round
  // I will keep it though because it ends up being accurate after the webp files are clipped
  // (there is a tendency for the smaller parts to be less than the sum of the whole)
  howManyImages = Math.round(webpFileSizeEquivalent/targetFileSize);

  if(howManyImages == 0) howManyImages = 1;

  let groups = []
  for (let member of distributeInteger(rows, howManyImages)) {
    groups.push(member)
  }

  c.l('groups')
  c.l(groups);

  // start current starting row at 1
  let currentStartingRow = 1;
  for (const [index, amountOfRows] of groups.entries()) {
    const realIndex = index + 1;
    // console.log(realIndex , amountOfRows)

    const widthToUse = groups.length === 1 ? dimensions.width : totalWidth;

    // create image
    const splitObject = {
      left: 0, // always starting in left
      top: ( currentStartingRow - 1) * imageHeight,
      width: widthToUse, // always the full width of the image
      height: amountOfRows * imageHeight,
    }

    c.l('split object');
    console.log(splitObject)

    if(extract){
      await image
        .extract(splitObject)
        .toFile(`${outputFolder}/${filename}-${realIndex}.webp`)
    }

    const webvttObject = {
      startingRow: currentStartingRow,
      finishingRow: currentStartingRow + (amountOfRows - 1), // if you do only 1 row you finish same row
      imageNumber: realIndex,
      amountOfRows
    }

    imagesWithRows.push(webvttObject);

    currentStartingRow = currentStartingRow + amountOfRows
  }

  console.log('running here!');
  return imagesWithRows
}

module.exports = clipSpriteThumbnail
