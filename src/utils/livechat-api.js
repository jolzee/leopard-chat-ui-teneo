import config from "./livechat-config";
import axios from "axios";
import Vue from "vue";

const GET = "GET";
const { server_url } = config;

const createApiRequest = (method, route, accessToken, login) => {
  return axios({
    method,
    url: server_url + route,
    headers: {
      Authorization: "Bearer " + accessToken,
      DateInterval: 1,
      "X-API-Version": "2",
      Agent: login
    }
  }).catch(function(error) {
    Vue.$log.error(error);
  });
};

const api = {
  fetchAgents: accessToken => createApiRequest(GET, "/agents", accessToken),
  fetchAgentRatings: (login, accessToken) =>
    createApiRequest(GET, "/ratings/week", accessToken, login),
  fetchAgentAvailability: (login, accessToken) =>
    createApiRequest(GET, "/availability", accessToken, login),
  fetchChattingTime: (login, accessToken) =>
    createApiRequest(GET, "/chatting", accessToken, login)
};

export default api;
