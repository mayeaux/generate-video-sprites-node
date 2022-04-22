// Change the second argument to your options:
// https://github.com/sampotts/plyr/#options
const player = new Plyr('video', {

  controls: ['play-large', 'play', 'progress', 'current-time', 'duration'],

  previewThumbnails: {
    enabled: true,
    src: ['./assets/video_sprite.vtt'] },

  captions: { active: true } });

// Expose player so it can be used from the console
window.player = player;
