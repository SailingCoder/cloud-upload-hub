const axios = require('axios');

const gettarget = (mode) => {
  const targets = {
    test: 'test/sailing',
    tice: 'tice/sailing',
    prod: 'prod/sailing',
  };
  return targets[mode] || targets.test; // 默认使用 test
};

const defineConfig = ({ mode }) => {
  return {
    source: 'src',  // 上传源路径
    target: gettarget(mode),  // 上传目标路径
    retryLimit: 5,  // 重试次数
    maxConcurrent: 10,  // 最大并发量
    lastFile: 'index.html',  // 最后一个文件
    ossCredentials: './externalConfigs/ossCredentials.js',  // 该路径包含 OSS 的具体配置文件
    cosCredentials: async () => ({
      SecretId: 'xxx',  // COS的秘密ID
      SecretKey: 'xxx'  // COS的秘密密钥
    }),
    uploaderModules: [
      "./src/upload/ossUpload", 
      "./src/upload/cosUpload",
    ],  // 自定义上传路径
    onUploadSuccess(status) {  // 成功处理函数
      console.log('构建成功', status);
      axios.post('https://api.github.com/repos/xxx/xxx/deployments', {
        headers: {
          Authorization: `Bearer xxx`  // 认证信息
        },
        data: {
          ref: 'master',
          auto_merge: false,
          required_contexts: [],
          payload: {
            build: 'success'
          }
        }
      }).then(response => {
        console.log('通知成功', response.data);
      }).catch(error => {
        console.error('通知失败', error);
      });  
    },
    onUploadFail(status) {  // 失败处理函数
      console.log('构建失败', status);
      axios.post('https://api.github.com/repos/xxx/xxx/deployments', {
        headers: {
          Authorization: `Bearer xxx`  // 认证信息
        },
        data: {
          ref: 'master',
          auto_merge: false,
          required_contexts: [],
          payload: {
            build: 'fail'
          }
        }
      }).then(response => {
        console.log('通知成功', response.data);
      }).catch(error => {
        console.error('通知失败', error);
      });  
    }
  };
};

module.exports = { defineConfig };