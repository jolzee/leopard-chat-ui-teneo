// scripts for ASR and TTS
var enableTTS = true;
var lang = "en-GB";
var final_transcript = "";
var recognizing = false;
var ignore_onend;
var start_timestamp;
var timeoutVar;

if (
  !("webkitSpeechRecognition" in window) &&
  !("SpeechRecognition" in window)
) {
  console.log("No Speech Recognition");
} else {
  var recognition = null;
  try {
    recognition = new SpeechRecognition();
  } catch (Exception) {
    console.log("Not on firefox");
  }
  try {
    recognition = new webkitSpeechRecognition();
  } catch (Exception) {
    console.log("Not on chrome");
  }

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 0;

  recognition.onstart = function() {
    console.log(lang);
    console.log("recognition.onstart");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    recognizing = true;
  };

  recognition.onerror = function(event) {
    console.log("recognition.onerror: " + event.error);
    clearTimeout(timeoutVar);
    if (event.error == "no-speech") {
      console.log("speech error: speech not supported");
      ignore_onend = true;
    }
    if (event.error == "audio-capture") {
      console.log("speech error: mic not available");
      ignore_onend = true;
    }
    if (event.error == "not-allowed") {
      console.log("speech error: not allowed");
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    console.log("recognition.onend");
    clearTimeout(timeoutVar);
    recognizing = false;
    if (ignore_onend) {
      return;
    }

    // if (!final_transcript) {
    //   $("#final_span").val($("#dynamic_transcript").html());
    // }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById("final_span"));
      window.getSelection().addRange(range);
      console.log("Range value: [" + range + "]");
      if (range != "") {
        alert(range);
        // final_span.innerHTML = "";
      }
    }
  };

  recognition.onresult = function(event) {
    clearTimeout(timeoutVar);
    var interim_transcript = "";
    if (typeof event.results == "undefined") {
      console.log("recognition.onresult event.results undefined");
      recognition.onend = null;
      recognition.stop();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    final_span.innerHTML = capitalize(final_transcript);
    //$('#dynamic_transcript').html(interim_transcript);
    processPartialVoiceInput(interim_transcript);
    timeoutVar = setTimeout(function() {
      console.log("timeout, aborting recognition");
      recognizing = false;
      recognition.abort();
    }, 1500);
  };
}

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    var msg = new SpeechSynthesisUtterance(message);
    msg.lang = lang;
    // only speak when window has focus
    if (document.hasFocus()) {
      window.speechSynthesis.speak(msg);
    }

    msg.onend = function(e) {
      console.log("Finished in " + event.elapsedTime + " seconds.");
      if (openMicAfterTTS) {
        appStartASR();
      }
    };
  }
}
