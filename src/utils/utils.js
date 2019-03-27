export function mergeAsrCorrections(activeSolution, leopardDefaultCorrections) {
  let finalCorrections = leopardDefaultCorrections;
  if ("asrCorrections" in activeSolution) {
    let solutionResplacements = [];
    let lines = activeSolution.asrCorrections.split(/\r?\n/);
    lines.forEach(replacement => {
      if (replacement.trim() !== "") {
        let thisThatArray = replacement.split(/\|/);
        if (thisThatArray.length === 2) {
          thisThatArray[0] = thisThatArray[0].trim();
          thisThatArray[1] = thisThatArray[1].trim();
          console.log(thisThatArray);
          solutionResplacements.push(thisThatArray);
        }
      }
    });
    finalCorrections = leopardDefaultCorrections.concat(solutionResplacements);
  }
  return finalCorrections;
}

export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
