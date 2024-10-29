// uploaderRegistry.js 用户注册上传器的接口
const minimist = require("minimist");
const { loadConfig } = require("../utils/file");
const { validateConfig } = require("../utils/validate");

const argv = minimist(process.argv.slice(2));
const uploaders = [];

function registerUploader(UploaderClass, config) {
  const configName = config?.configName; // 配置文件名
  const configRequiredFields = config?.configRequiredFields; // 配置文件必填字段
  const headerName = config?.headerName; // 头部配置名
  const type = config?.type; // 上传器类型
  try {
    if (!argv[configName]) {
      return
    }

    const configData = loadConfig(argv[configName]);
    const headers = argv[headerName] ? JSON.parse(argv[headerName]) : {};
    validateConfig(configData, configRequiredFields, type);

    const defaultConfig = {
      uploadFrom: argv.uploadFrom,
      uploadTo: argv.uploadTo,
      maxRetryCount: Number(argv.maxRetryCount) || 5,
      concurrencyLimit: Number(argv.concurrency) || 10,
      headers,
      type,
    };

    const uploaderInstance = new UploaderClass({
      ...configData,
      ...defaultConfig,
    });

    uploaders.push(uploaderInstance);
  } catch (error) {
    console.error(`${type}上传器注册失败:`, error);
    process.exit(1);
  }
}

module.exports = { registerUploader, uploaders };
