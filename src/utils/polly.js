export default class Polly {
  constructor() {
    this.audio = null;
  }

  say(text, voice) {
    if (text && voice) {
      this.stop();
      this.audio = new Audio(
        `${window.leopardConfig.tts.url}?text=${encodeURIComponent(text)}&voice=${voice}`
      );
      this.audio.play();
    }
  }

  stop() {
    if (this.audio) {
      // console.log("Pausing Audio!!!");
      this.audio.pause();
      this.audio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=";
    }
  }
}
