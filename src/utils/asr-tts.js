import Artyom from "artyom.js"; // for speech recognition and tts
import replaceString from "replace-string";
const logger = require("@/utils/logging").getLogger("asr-tts.js");

export function initializeTTS(locale) {
  let artyom = null;
  // Artyom Speech Recognition and TTS
  if (
    Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
    Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
  ) {
    artyom = new Artyom();

    // control the voices used by Web Speech API
    if (locale === "en-us-male") {
      artyom.ArtyomVoicesIdentifiers["en-US"] = [
        "Microsoft David Desktop - English (United States)",
        "Google US English",
        "en-US",
        "en_US"
      ];
    } else if (locale === "en-us-female") {
      artyom.ArtyomVoicesIdentifiers["en-US"] = [
        "Microsoft Zira Desktop - English (United States)",
        "Google US English",
        "en-US",
        "en_US"
      ];
    } else if (locale === "en-uk-male") {
      artyom.ArtyomVoicesIdentifiers["en-GB"] = [
        "Google UK English Male",
        "Google UK English Female",
        "en-GB",
        "en_GB"
      ];
    } else {
      artyom.ArtyomVoicesIdentifiers["en-GB"] = [
        "Google UK English Female",
        "Google UK English Male",
        "en-GB",
        "en_GB"
      ];
    }

    // Control the Speech Recognition for Web Speech API
    // artyom.ArtyomProperties = {
    //   asrLang: "en-GB",
    //   lang: "en-GB",
    //   recognizing: false,
    //   continuous: false,
    //   speed: 1,
    //   volume: 1,
    //   listen: false,
    //   mode: "normal",
    //   debug: false,
    //   helpers: {
    //     redirectRecognizedTextOutput: null,
    //     remoteProcessorHandler: null,
    //     lastSay: null,
    //     fatalityPromiseCallback: null
    //   },
    //   executionKeyword: null,
    //   obeyKeyword: null,
    //   speaking: false,
    //   obeying: true,
    //   soundex: true,
    //   name: null
    // };

    if (window.leopardConfig.asrLangCode) {
      artyom.ArtyomProperties.asrLang = window.leopardConfig.asrLangCode;
    }

    artyom.initialize({
      soundex: true,
      continuous: false,
      listen: false, // Start recognizing
      lang:
        locale === "fr"
          ? "fr-FR"
          : locale === "ru"
          ? "ru-RU"
          : locale === "da"
          ? "da-DK"
          : locale === "sv"
          ? "sv-SE"
          : locale === "no"
          ? "no-NO"
          : locale === "de"
          ? "de-DE"
          : locale === "it"
          ? "it-IT"
          : locale === "pt"
          ? "pt-PT"
          : locale === "nl"
          ? "nl-NL"
          : locale === "es"
          ? "es-ES"
          : locale === "jp"
          ? "ja-JP"
          : locale === "cn"
          ? "zh-CN"
          : locale === "cn(hk)"
          ? "zh-HK"
          : locale === "id"
          ? "id-ID"
          : locale.startsWith("en-us")
          ? "en-US"
          : locale.startsWith("en-gb")
          ? "en-GB"
          : locale,
      debug: false
    });
  }
  return artyom;
}

export function initializeASR(store, asrCorrections) {
  // let asr = null;
  let timeoutVar;
  if (store.state.tts.tts !== null) {
    store.state.asr.asr = store.state.tts.tts.newDictation({
      soundex: true,
      continuous: false, // Enable continuous if HTTPS connection
      onResult: function (text) {
        clearTimeout(timeoutVar);
        // Do something with the text
        if (text) {
          //text = text.replace(/^\w/, c => c.toUpperCase()); // uppercase first letter of user input -- use cautiously
          text = text.replace(/what's/gi, "what is");
          store.commit("SET_USER_INPUT", text);
        }
        timeoutVar = setTimeout(function () {
          logger.debug("timeout - aborting recognition");
          store.state.asr.asr.stop();
          if (text) {
            store.commit("SET_USER_INPUT", text); // final transcript from ASR
          }
        }, 800);
      },
      onStart: function () {
        logger.debug("ASR capture started");
      },
      onEnd: function () {
        store.commit("HIDE_LISTENING_OVERLAY");

        if (store.getters.stopAudioCapture) {
          logger.debug("ASR capture was manually stopped");
          store.commit("CLEAR_USER_INPUT");
          store.commit("STOP_AUDIO_CAPTURE");
          // store.state.asr.stopAudioCapture = false;
          return;
        }
        // let's fix any ASR transcription errors

        if (store.getters.userInput) {
          let fixedUserInput = store.getters.userInput;
          logger.debug("Final Transcription from ASR: " + store.state.userInput.userInput);
          asrCorrections.forEach(replacement => {
            let startingText = fixedUserInput;

            if (replacement[0].indexOf(".") > -1) {
              fixedUserInput = replaceString(
                fixedUserInput.toLowerCase(),
                replacement[0].toLowerCase(),
                replacement[1].toLowerCase()
              );
            } else {
              let search = replacement[0].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // escape any special characters
              var re = new RegExp("\\b" + search + "\\b", "gi");
              // fixedUserInput = fixedUserInput.toLowerCase().replace(re, replacement[1].toLowerCase());
              fixedUserInput = fixedUserInput.replace(re, replacement[1]);
            }

            // logger.debug(
            //   `Starting: ${startingText} | Ending: ${fixedUserInput}`
            // );

            if (startingText.toLowerCase() !== fixedUserInput.toLowerCase()) {
              logger.debug(
                "Made a change to ASR response: " + replacement[0] + " >> " + replacement[1]
              );
            }
          });

          if (store.getters.userInput.toLowerCase() !== fixedUserInput.toLowerCase()) {
            store.commit("SET_USER_INPUT", fixedUserInput);
            logger.debug(`Final Transcription: ${fixedUserInput}`);
          }

          setTimeout(function () {
            store.commit("USER_INPUT_READY_FOR_SENDING");
          }, 500);
        }
      }
    });
  }
  // return asr;
}
