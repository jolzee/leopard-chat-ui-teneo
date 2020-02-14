const TIE = require("@artificialsolutions/tie-api-client");

const teneoEngineUrl =
  "https://teneo-demos-fusion.presales.artificial-solutions.com/leopard/";
const logResponse = response => {
  console.log(response);
  return response;
};

TIE.sendInput(teneoEngineUrl, null, {
  text: "Show a inline map",
  headers: { first: "First Value", second: "Second Header" }
})
  .then(logResponse)
  .then(({ sessionId }) =>
    TIE.sendInput(teneoEngineUrl, sessionId, { text: "KHOROS" })
  )
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl, sessionId));
