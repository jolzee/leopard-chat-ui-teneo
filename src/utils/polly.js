const logger = require("@/utils/logging").getLogger("polly.js");
export default class Polly {
  constructor() {
    this.audio = null;
  }

  async say(text, voice) {
    if (text && voice && this.audio) {
      logger.debug("Audio is not null - wait for polly to finish");
      await this.waitForPollyToFinish();
      this.playAudio(text, voice);
    } else if (text && voice) {
      logger.debug("Audio is null - play audio");
      this.playAudio(text, voice);
    }
  }

  destroy() {
    this.audio = null;
  }

  playAudio(text, voice) {
    this.stop();
    this.audio = new Audio(
      `${window.leopardConfig.tts.url}?text=${encodeURIComponent(text)}&voice=${voice}`
    );
    this.audio.play();
  }

  waitForPollyToFinish() {
    return new Promise(resolve => {
      if (this.isPaused()) {
        resolve();
      }
      let that = this;
      let interval = setInterval(() => {
        if (that.isPaused()) {
          clearInterval(interval);
          resolve();
        }
      }, 300);
    });
  }

  isPaused() {
    return this.audio ? this.audio.paused : true;
  }

  isPlaying() {
    return !this.isPaused();
  }

  stop() {
    if (this.isPlaying()) {
      // console.log("Pausing Audio!!!");
      this.audio.pause();
      this.audio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=";
    }
  }
}
