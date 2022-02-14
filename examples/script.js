// Change the second argument to your options:
// https://github.com/sampotts/plyr/#options
const player = new Plyr('video', {

  previewThumbnails: {
    enabled: true,
    src: ['tksKexZ_sprite.vtt'] },

  captions: { active: true } });

// Expose player so it can be used from the console
window.player = player;
