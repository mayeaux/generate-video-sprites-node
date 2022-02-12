const sharp = require("sharp");

const originalFilename = "./output/hABy9sJ_sprite.webp";

const image = sharp(originalFilename);

const rows = 13;
const columns = 9;

const imageWidth = 70;
const imageHeight = 140;

const totalKb = 2100;
const totalTargetSize = 500;
const totalWidth = columns * imageWidth;

const amountToSplit = Math.floor(totalKb/totalTargetSize) // 4

const howManySplits = Math.floor(rows/amountToSplit);

const remainder = rows % amountToSplit;

console.log(howManySplits);
console.log(remainder);

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
