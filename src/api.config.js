// api.config.js

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const ENDPOINTS = {
  login: `${BASE_URL}/login`,
  logout: `${BASE_URL}/logout`,
  register: `${BASE_URL}/register`,
  forget: `${BASE_URL}/reset`,
  sendMailVerification: `${BASE_URL}/emailVerify`,
  getUserInfo: `${BASE_URL}/userInfo`,
  users: {
    updete: `${BASE_URL}/users/update`,
    delete: `${BASE_URL}/users/delete`,
    list: `${BASE_URL}/users/list`,
  },
  s3: {
    deletefile: `${BASE_URL}/s3/delete`,
    filelist: `${BASE_URL}/s3/list`,
    getCurrentSize: `${BASE_URL}/s3/size`,
    getDownloadUrl: `${BASE_URL}/s3/download`,
    mvOrRename: `${BASE_URL}/s3/mv`,
    mkdir: `${BASE_URL}/s3/mkdir`,
    bucketmap: {
      delate: `${BASE_URL}/s3/bucketmap/del`,
      list: `${BASE_URL}/s3/bucketmap/list`,
      update: `${BASE_URL}/s3/bucketmap/update`,
    },
    upload: {
      smallFile: `${BASE_URL}/s3/upload/small`,
      bigFile: {
        create: `${BASE_URL}/s3/upload/big/create`,
        finish: `${BASE_URL}/s3/upload/big/finish`,
      },
      task: {
        abort: `${BASE_URL}/s3/upload/task/abort`,
        delete: `${BASE_URL}/s3/upload/task/del`,
        add: `${BASE_URL}/s3/upload/task/add`,
        done: `${BASE_URL}/s3/upload/task/done`,
        percentUpdate: `${BASE_URL}/s3/upload/task/percent/update`,
        getPercent: `${BASE_URL}/s3/upload/task/percent`,
        getlist: `${BASE_URL}/s3/upload/task/list`,
      }
    }
  },
};
