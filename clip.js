const sharp = require("sharp");

const originalFilename = "./output/hABy9sJ_sprite.webp";

const image = sharp(originalFilename);

const rows = 13;
const columns = 9;

const imageWidth = 140;
const imageHeight = 70;

const totalKb = 2100;
const totalTargetSize = 500;
const totalWidth = columns * imageWidth;


const howManySplits = Math.floor(totalKb/totalTargetSize) // 4
// console.log(howManySplits);

const amountOfRowsPerSplit = Math.floor(rows/howManySplits);

const remainder = rows % amountOfRowsPerSplit;

const createdArray = Array.from({length: (howManySplits)}, (_, i) => i + 1)

createdArray.forEach(function (value, i) {

  let amountOfRowsToHit = amountOfRowsPerSplit;

  const topPosition = (value - 1) * amountOfRowsToHit

  if(value == createdArray.length){
    amountOfRowsToHit = amountOfRowsToHit + remainder
    console.log('add remainder');
  }

  console.log(topPosition);
  console.log(amountOfRowsToHit);

  image
    .extract({ left: 0, top: topPosition * imageHeight, width: totalWidth, height: amountOfRowsToHit * imageHeight })
    .toFile(`./output/${value}.webp`, function(err) {
      // Save the top of the image to a file named "top.jpg"
    });

  console.log(`${value} | ${amountOfRowsToHit}`);
});

// console.log(howManySplits);
// console.log(remainder);
//
// console.log(createdArray)

return


image
  .extract({ left: 0, top: 0, width: imageWidth, height: 300 })
  .toFile("top.jpg", function(err) {
    // Save the top of the image to a file named "top.jpg"
  });

image
  .extract({ left: 0, top: 300, width: imageWidth, height: 300 })
  .toFile("bottom.jpg", function(err) {
    // Save the bottom of the image to a file named "bottom.jpg"
  });
