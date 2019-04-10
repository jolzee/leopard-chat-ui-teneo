const urlMimeType = require("url-mime-type/lib/index");
urlMimeType(
  "https://media.cntraveler.com/photos/570e52cfc6f06baa0938c376/4:3/w_480,c_limit/GettyImages-186254202.jpg"
).then(result => {
  console.log(result);
});

const LZString = require("lz-string");
let config = `
solution-config
`;
let compressed = LZString.compressToEncodedURIComponent(config);
console.log(compressed);

var TinyURL = require("tinyurl");
TinyURL.shorten("https://ok/?import=" + compressed, function(res) {
  console.log(res); //Returns a shorter version of http://google.com - http://tinyurl.com/2tx
});

// let decompressed = LZString.decompressFromEncodedURIComponent(compressed);
// console.log(decompressed);
