import config from "@/utils/livechat-config";

const superagent = require("superagent");
const logger = require("@/utils/logging").getLogger("livechat-api.js");

const { serverUrl } = config;

const createApiRequest = (route, accessToken, login) => {
  return superagent
    .get(serverUrl + route)
    .accept("json")
    .set({
      Authorization: `Bearer ${accessToken}`,
      DateInterval: 1,
      "X-API-Version": "2",
      Agent: login
    })
    .then(res => {
      return res.body;
    });
};

const api = {
  fetchAgents: accessToken => createApiRequest("/agents", accessToken),
  fetchAgentRatings: (login, accessToken) => createApiRequest("/ratings/week", accessToken, login),
  fetchAgentAvailability: (login, accessToken) =>
    createApiRequest("/availability", accessToken, login),
  fetchChattingTime: (login, accessToken) => createApiRequest("/chatting", accessToken, login)
};

export default api;
