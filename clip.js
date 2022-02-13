const sharp = require("sharp");

function clipSpriteThumbnail({
   fullThumbnailPath,
   rows,
   columns,
   imageWidth,
   imageHeight,
   totalFileSize,
   targetFileSize,
   filename
}){

  // path to file
  const originalFilename = fullThumbnailPath;

  console.log(fullThumbnailPath);

  // load sharp
  const image = sharp(originalFilename);

  // width of thumbnail is column times image width
  const totalWidth = columns * imageWidth;

  const imagesWithRows = [];


  console.log('total');
  console.log(totalFileSize, targetFileSize)

  if(targetFileSize > totalFileSize) return

  // rough estimate of how many times to split by total size divided by target
  const howManySplits = Math.floor(totalFileSize/targetFileSize);

  console.log('rows howManySplits')
  console.log(rows, howManySplits);

  // how many rows that should happen per file
  const amountOfRowsPerSplit = Math.floor(rows/howManySplits);

  // how many rows are left out from the split
  const remainder = rows % amountOfRowsPerSplit;

  // create an array for each split
  const createdArray = Array.from({length: (howManySplits)}, (_, i) => i + 1)

  // loop through and create splits
  createdArray.forEach(function (value, i) {

    // how many rows per image (remainder will be added)
    let amountOfRowsToHit = amountOfRowsPerSplit;

    console.log(rows, amountOfRowsToHit);

    // really should be renamed 'starting row'
    const topPosition = (value - 1) * amountOfRowsToHit

    console.log('starting row');
    const startingRow = topPosition
    console.log(startingRow)



    // add remainder to final clip
    if(value == createdArray.length){
      amountOfRowsToHit = amountOfRowsToHit + remainder
    }

    console.log('finishing row');
    const finishingRow = topPosition + amountOfRowsToHit
    console.log(finishingRow);

    const thingObject = {
      startingRow, finishingRow
    }

    imagesWithRows.push(thingObject);

    // load details
    const splitObject = {
      left: 0,
      top: topPosition * imageHeight,
      width: totalWidth,
      height: amountOfRowsToHit * imageHeight
    }

    // console.log('split object');
    // console.log(splitObject)

    // (async function(){
    //   const response = await image.extract(splitObject).toFile(`./output/${filename}-${value}.webp`)
    //   // console.log(response);
    // })()

    // const response = await image.extract(splitObject).toFile(`./output/${filename}-${value}.webp`)
    // console.log(response);
    //
    // return response
    // create split
    image
      .extract(splitObject)
      .toFile(`./output/${filename}-${value}.webp`, function(err) {
        console.log(err);
      }); //TODO: should make this a bit smarter

    // console.log(`${value} | ${amountOfRowsToHit}`);
  });

  return true
}

module.exports = clipSpriteThumbnail

// console.log(howManySplits);
// console.log(remainder);
//
// console.log(createdArray)

// return


// image
//   .extract({ left: 0, top: 0, width: imageWidth, height: 300 })
//   .toFile("top.jpg", function(err) {
//     // Save the top of the image to a file named "top.jpg"
//   });
//
// image
//   .extract({ left: 0, top: 300, width: imageWidth, height: 300 })
//   .toFile("bottom.jpg", function(err) {
//     // Save the bottom of the image to a file named "bottom.jpg"
//   });
