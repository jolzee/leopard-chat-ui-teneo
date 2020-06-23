const logger = require("@/utils/logging").getLogger("polly.js");
export default class Polly {
  constructor() {
    this.audio = null;
  }

  async say(text, voice, waitToFinish = false) {
    if (text && voice && this.audio !== null) {
      logger.debug("Audio is not null - wait for polly to finish");
      if (waitToFinish) await this.waitForPollyToFinish();
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
    logger.debug(`About to have Polly(${voice}) say: ${text}`);
    this.stop();
    const audioUrl = `${window.leopardConfig.tts.url}?text=${encodeURIComponent(
      text
    )}&voice=${voice}`;
    if (this.audio) {
      this.audio.src = audioUrl;
    } else {
      this.audio = new Audio(audioUrl);
    }

    this.audio.play();
  }

  waitForPollyToFinish() {
    return new Promise(resolve => {
      if (this.isPaused()) {
        resolve();
        return;
      }
      let that = this;
      let interval = setInterval(() => {
        if (that.isPaused()) {
          clearInterval(interval);
          resolve();
          return;
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
    logger.debug(`Asking Polly to stop.`);
    if (this.isPlaying()) {
      // console.log("Pausing Audio!!!");
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=";
      logger.debug("Polly audio stopped because it was playing.");
      return;
    }
    logger.debug("Didn't need to stop Polly audio as it wasn't playing.");
  }
}
