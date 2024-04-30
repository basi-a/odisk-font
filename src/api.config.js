// api.config.js

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const ENDPOINTS = {
  login: `${BASE_URL}/login`,
  logout: `${BASE_URL}/logout`,
  register: `${BASE_URL}/register`,
  forget: `${BASE_URL}/reset`,
  sendMailVerification: `${BASE_URL}/emailVerify`,
  getUserInfo: `${BASE_URL}/userInfo`,
  s3: {
    delatefile: `${BASE_URL}/s3/delate`,
    filelist: `${BASE_URL}/s3/list`,
    getDownloadUrl: `${BASE_URL}/s3/download`,
    mvOrRename: `${BASE_URL}/s3/mv`,
    mkdir: `${BASE_URL}/s3/mkdir`,
    upload: {
      smallFile: `${BASE_URL}/s3/upload/small`,
      bigFile: {
        create: `${BASE_URL}/s3/upload/big/create`,
        finish: `${BASE_URL}/s3/upload/big/finish`,
      },
      task: {
        delate: `${BASE_URL}/s3/task/del`,
        add: `${BASE_URL}/s3/task/add`,
        done: `${BASE_URL}/s3/task/done`,
        getlist: `${BASE_URL}/s3/task/list`,
      }
    }
  },
};
