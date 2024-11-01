// uploaderRegistry.js 用户注册上传器的接口
const { validateConfig, isPromise } = require("../utils/validate");
const { loadConfig } = require("../utils/file");
const { getConfigData } = require("../store/config");

const uploaders = [];

// 获取上传器配置数据，支持传递 ”函数、对象、字符串“ 3 种类型
function getUploaderConfigData(uploaderConfig) {
  if (typeof uploaderConfig === 'function') {
    const result = uploaderConfig();
    if (isPromise(result)) {
      throw new Error("Uploader config function must be synchronous");
    }
    return result || {};
  } else if (typeof uploaderConfig === 'object') {
    return uploaderConfig;
  } else if (typeof uploaderConfig === 'string') {
    return loadConfig(uploaderConfig);
  }
  return {};
}

// 注册上传器
function registerUploader(UploaderClass, options) {
  const configData = getConfigData();

  const configName = options?.configName; // 配置文件名
  const configRequiredFields = options?.configRequiredFields; // 配置文件必填字段
  const headerName = options?.headerName; // 头部配置名
  const type = options?.type; // 上传器类型
  try {
    const uploaderConfig = configData[configName]; // 上传器配置名，可以为函数、对象、字符串
    if (!uploaderConfig) {
      // console.warn(`${type}上传器配置不存在: ${configName}`);
      return
    }

    const uploaderConfigData = getUploaderConfigData(uploaderConfig);

    const headers = configData[headerName] ? JSON.parse(configData[headerName]) : {};

    if (configRequiredFields?.length) { // 配置文件必填字段
      validateConfig(uploaderConfigData, configRequiredFields, type);
    }

    const defaultConfig = {
      source: configData.source,
      target: configData.target,
      retryLimit: Number(configData.retryLimit) || 5,
      concurrencyLimit: Number(configData.concurrency) || 10,
      headers,
      type,
    };

    const uploaderInstance = new UploaderClass({
      ...defaultConfig,
      ...uploaderConfigData,
    });

    uploaders.push(uploaderInstance);
  } catch (error) {
    console.error(`${type}上传器注册失败:`, error);
    process.exit(1);
  }
}

module.exports = { registerUploader, uploaders };
