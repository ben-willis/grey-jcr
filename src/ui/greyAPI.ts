import axios from "axios";

declare var GREY_API_URL: string;

// tslint:disable-next-line:no-var-requires
const greyAPI = axios.create({
  baseURL: GREY_API_URL,
  withCredentials: true,
});

export default greyAPI;
