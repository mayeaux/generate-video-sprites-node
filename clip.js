const sharp = require("sharp");
const sizeOf = require('image-size')
const joinImages = require("join-images");
const fs = require('fs-extra');

// given the rows, and amount of images, determine how to split them
// for example if it's 9 images and 5 files, we want [2,2,2,2,1]
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

function range(start, end) {
  var myArray = [];
  for (var i = start; i <= end; i += 1) {
    myArray.push(i);
  }
  return myArray;
};


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
   outputFolder,
   averageRowSizeInKb,
   outputFileDirectory
}){

  if(!debug){
    const c = {
      l : undefined
    }
  }

  // load sharp
  // const image = sharp(fullThumbnailPath);
  // c.l('image width, image height');
  // c.l(imageWidth, imageHeight);
  //
  // const dimensions = sizeOf(fullThumbnailPath);
  // c.l('Image size:')
  // c.l(dimensions)
  //
  // // width of thumbnail is column times image width
  const totalWidth = columns * imageWidth;
  // c.l('Calculated width:')
  // c.l(totalWidth);
  //
  // used for creating the webvtt
  const imagesWithRows = [];
  //
  // // no need to compress
  // // cant skip because this is also used for webvtt
  // // if(targetFileSize > totalFileSize) return
  //
  // const webpFileSizeEquivalent = Math.round(totalFileSize - (totalFileSize * 0.3));
  //
  // c.l('totalFileSize, targetFileSize, webpFileSizeEquivalent');
  // c.l(totalFileSize, targetFileSize, webpFileSizeEquivalent);

  // rough estimate of how many images are needed with total size / target
  // let howManyImages;

  // this is actually a bug, it should be Math.round
  // I will keep it though because it ends up being accurate after the webp files are clipped
  // (there is a tendency for the smaller parts to be less than the sum of the whole)
  // howManyImages = Math.round(webpFileSizeEquivalent/targetFileSize);

  const maximumRowsPerImage = Math.floor(targetFileSize/averageRowSizeInKb);
  let howManyImages = Math.floor(rows / maximumRowsPerImage);

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
    const imageNumber = realIndex;
    // console.log(realIndex , amountOfRows)

    // const widthToUse = groups.length === 1 ? dimensions.width : totalWidth;

    // increment the next starting row
    const finishingRow = currentStartingRow + (amountOfRows - 1) // if you do only 1 row you finish same row

    c.l('starting, ending');
    c.l(currentStartingRow, finishingRow)

    c.l('start, finish row');
    c.l(currentStartingRow, finishingRow)

    const rangeArray = range(currentStartingRow, finishingRow);
    c.l('range array', rangeArray)

    const horizontalImagesDirectory = `${outputFileDirectory}/processing/horizontalImages`;

    const finalOutputPath = `${outputFileDirectory}/video-${imageNumber}.webp`

    if(rangeArray.length === 1){
      const currentDirectory = `${horizontalImagesDirectory}/${rangeArray[0]}.webp`;
      fs.copy(currentDirectory, finalOutputPath)
    } else {
      let arrayOfImages = [];
      for(const horizontalImageNumber of rangeArray){
        arrayOfImages.push(`${horizontalImagesDirectory}/${horizontalImageNumber}.webp`);
      }

      console.log(arrayOfImages);

      // create Sharp instance
      const verticalJoinSharpInstance = await joinImages.joinImages(arrayOfImages, { direction: 'vertical'})


      // save Sharp instance to file
      // TODO: have to change this here (to clear sprite image)
      const verticalJoinedImageResponse = await verticalJoinSharpInstance.toFile(finalOutputPath);
    }

    const webvttObject = {
      startingRow: currentStartingRow,
      finishingRow: currentStartingRow + (amountOfRows - 1), // if you do only 1 row you finish same row
      imageNumber: realIndex,
      amountOfRows
    }

    imagesWithRows.push(webvttObject);

    currentStartingRow = currentStartingRow + amountOfRows;
  }

  console.log('running here!');
  return imagesWithRows
}

module.exports = clipSpriteThumbnail
