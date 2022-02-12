var sharp = require('sharp');
sharp('hABy9sJ_sprite.png')
  .png({ compressionLevel: 9, quality: 1, adaptiveFiltering: true, force: true })
  .withMetadata()
  .toFile('./examples/dist/hABy9sJ_sprite.png', function(err) {
    console.log(err);
  });
