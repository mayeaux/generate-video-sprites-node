const joinImages = require('join-images');
const fs = require('fs');

async function createFullImage({ columns, existingPath }){

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
        fileNameArray.push(`${prePath}/thumb-${imageNumber}.png`);
      }
    }

    return fileNameArray
  }

  // how many screenshot images there are in total
  let amountOfFiles = fs.readdirSync(existingPath)
                      .filter( function( elm ) {return elm.match(/.*\.(png?)/ig);})
                      .length;

  // calculate the total amount of rows
  const rows = Math.ceil(amountOfFiles / columns);

  const prePath = existingPath;

  const outputPath = './alltogether';

  // loop through all the rows and create the horizontally joined images
  for(let x = 1; x < rows + 1; x++){

    // create array with the amount of images being the columns
    const array = createArray(columns, x);

    // create Sharp instance
    const sharpHorizontalInstance = await joinImages.joinImages(array, { direction: 'horizontal'});

    // save Sharp instance to file
    const horizontalImageResponse = await sharpHorizontalInstance.toFile(`${outputPath}/${x}.png`);
  }

  let amountOfHorizontalImages = fs.readdirSync(outputPath)
    .filter( function( elm ) {return elm.match(/.*\.(png?)/ig);})
    .length;

  // create array of next images to use
  let arrays = [];
  for(let x = 1 ; x < amountOfHorizontalImages + 1; x++){
    arrays.push(`${outputPath}/${x}.png`);
  }

  // create Sharp instance
  const verticalJoinSharpInstance = await joinImages.joinImages(arrays, { direction: 'vertical'})

  // save Sharp instance to file
  const verticalJoinedImageResponse = await verticalJoinSharpInstance.toFile(`${outputPath}/done.webp`);

  return 'success'
}

module.exports = createFullImage;
