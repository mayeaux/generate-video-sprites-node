const joinImages = require('join-images');
const fs = require('fs-extra');

async function createFullImage({
   columns,
   outputPath,
   spriteOutputFilePath,
   debug
}){
  const screenshotImagesDirectory = `${outputPath}/screenshotImages`;
  const horizontalImagesDirectory = `${outputPath}/horizontalImages`;
  const finalImageDirectory = `${outputPath}/finalImage`;

  fs.mkdirSync(horizontalImagesDirectory, { recursive: true });
  fs.mkdirSync(finalImageDirectory, { recursive: true });

  // how many screenshot images there are in total
  let amountOfFiles = fs.readdirSync(screenshotImagesDirectory)
                      .filter( function( elm ) {return elm.match(/.*\.(png?)/ig);})
                      .length;

  // calculate the total amount of rows
  const rows = Math.ceil(amountOfFiles / columns);

  // create array for
  function createArray(columns, startingAmount){
    // the image number to start it at
    const realStartingAmount = columns * (startingAmount - 1);

    // create array for a horizontal join
    const fileNameArray = [];
    // the amount of images equals the amount of columns
    for(let x = 1 ; x < columns + 1; x++){
      const imageNumber = realStartingAmount + x;
      // this conditional bugfixes where there would be one extra, I believe
      if(imageNumber <= amountOfFiles){
        fileNameArray.push(`${screenshotImagesDirectory}/thumb-${imageNumber}.png`);
      }
    }

    return fileNameArray
  }

  // loop through all the rows and create the horizontally joined images
  for(let x = 1; x < rows + 1; x++){

    // create array with the amount of images being the columns
    const array = createArray(columns, x);

    // create Sharp instance
    const sharpHorizontalInstance = await joinImages.joinImages(array, { direction: 'horizontal'});

    // save Sharp instance to file
    const horizontalImageResponse = await sharpHorizontalInstance.toFile(`${horizontalImagesDirectory}/${x}.png`);
  }

  // count how many horizontal images were created
  let amountOfHorizontalImages = fs.readdirSync(horizontalImagesDirectory)
    .filter( function( elm ) {return elm.match(/.*\.(png?)/ig);})
    .length;

  // create array of horizontal images to join vertically
  let arrays = [];
  for(let x = 1 ; x < amountOfHorizontalImages + 1; x++){
    arrays.push(`${horizontalImagesDirectory}/${x}.png`);
  }

  // create Sharp instance
  const verticalJoinSharpInstance = await joinImages.joinImages(arrays, { direction: 'vertical'})

  // save Sharp instance to file
  // TODO: have to change this here (to clear sprite image)
  const verticalJoinedImageResponse = await verticalJoinSharpInstance.toFile(spriteOutputFilePath);

  if(!debug){
    fs.removeSync(outputPath)
  }

  return 'success'
}

module.exports = createFullImage;
