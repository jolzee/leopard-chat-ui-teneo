export default class Polly {
  constructor() {
    this.audio = null;
  }

  async say(text, voice) {
    if (text && voice) {
      await waitForPollyToFinish();
      this.stop();
      this.audio = new Audio(
        `${window.leopardConfig.tts.url}?text=${encodeURIComponent(text)}&voice=${voice}`
      );
      this.audio.play();
    }
  }

  async waitForPollyToFinish() {
    while (true) {
      if (!isPlaying()) {
        return;
      }
      await null; // prevents app from hanging
    }
  }

  isPlaying() {
    return !this.audio.paused;
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
