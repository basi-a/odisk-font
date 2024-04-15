// api.config.js

const BASE_URL = import.meta.env.VITE_BASE_URL;


export const ENDPOINTS = {
  login: `${BASE_URL}/login`,
  register: `${BASE_URL}/register`,
  sendMailVerification: `${BASE_URL}/emailVerify`,
  s3: {
    upload: `${BASE_URL}/s3/upload`,
    smallFile: `${BASE_URL}/s3/upload/small`,
    bigFile: {
      upload: `${BASE_URL}/s3/upload/big`,
      create: `${BASE_URL}/s3/upload/big/create`,
    },
  },
};
