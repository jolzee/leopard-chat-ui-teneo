export default class Polly {
  constructor() {
    this.audio = null;
  }

  say(text, voice) {
    if (text) {
      this.audio = new Audio(
        `${window.leopardConfig.tts.url}?text=${encodeURIComponent(text)}&voice=${voice}`
      );
      this.audio.play();
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=";
    }
  }
}
