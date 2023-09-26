import { API_URL } from "../js/config.js"

// console.log(API_URL,"apiurl");

const API = axios.create({
  url: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
