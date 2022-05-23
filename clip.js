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
   rows,
   targetFileSize,
   debug = false,
   averageRowSizeInKb,
   outputFileDirectory
}){

  if(!debug){
    const c = {
      l : undefined
    }
  }

  // used for creating the webvtt
  const imagesWithRows = [];

  const maximumRowsPerImage = Math.floor(targetFileSize/averageRowSizeInKb);
  let howManyImages = Math.floor(rows / maximumRowsPerImage);

  if(howManyImages === 0) howManyImages = 1;

  let groups = []
  for (let member of distributeInteger(rows, howManyImages)) {
    groups.push(member)
  }

  c.l('groups')
  c.l(groups);

  // start current starting row at 1
  let currentStartingRow = 1;
  for (const [index, amountOfRows] of groups.entries()) {
    const imageNumber = index + 1;

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
      const verticalJoinedImageResponse = await verticalJoinSharpInstance.toFile(finalOutputPath);
    }

    //
    const webvttObject = {
      startingRow: currentStartingRow,
      finishingRow, // if you do only 1 row you finish same row
      imageNumber,
      amountOfRows
    }


    imagesWithRows.push(webvttObject);

    // increment the starting row for next loop
    currentStartingRow = currentStartingRow + amountOfRows;
  }

  return imagesWithRows
}

module.exports = clipSpriteThumbnail
