export default class Polly {
  constructor() {
    this.audio = null;
  }

  say(text, voice) {
    if (text && voice && this.audio) {
      this.waitForPollyToFinish();
      this.playAudio(text, voice);
    } else if (text && voice) {
      this.playAudio(text, voice);
    }
  }

  playAudio(text, voice) {
    this.stop();
    this.audio = new Audio(
      `${window.leopardConfig.tts.url}?text=${encodeURIComponent(text)}&voice=${voice}`
    );
    this.audio.play();
  }

  async waitForPollyToFinish() {
    while (true) {
      if (this.isPaused()) {
        return;
      }
      await null; // prevents app from hanging
    }
  }

  isPaused() {
    return this.audio ? this.audio.paused : true;
  }

  isPlaying() {
    return !this.isPaused();
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
