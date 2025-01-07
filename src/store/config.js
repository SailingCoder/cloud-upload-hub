// config/loadConfig.js
const fs = require('fs');
const path = require('path');
const { getArgv } = require('../utils/process');

let configData = {}; // 存储配置数据

function loadDefaultConfig() {
  const argv = getArgv();
  const configFilePath = path.resolve(process.cwd(), 'uploader.config.js');

  // 检查是否有配置文件
  if (fs.existsSync(configFilePath)) {
    // 如果根目录下有 uploader.config.js 文件，优先使用
    const { defineConfig } = require(configFilePath);
    if (typeof defineConfig !== 'function') {
      throw new Error('uploader.config.js 需要导出一个 defineConfig 函数');
    }
    configData = defineConfig({ mode: argv.mode });
  } else if (argv.config) {
    // 如果命令行指定了配置文件路径，使用指定的路径
    const configPath = resolveConfigPath(argv.config);
    const { defineConfig } = require(configPath);
    if (typeof defineConfig !== 'function') {
      throw new Error('配置文件需要导出一个 defineConfig 函数');
    }
    configData = defineConfig({ mode: argv.mode });
  } else {
    // 没有配置文件时，使用命令行参数中的值
    configData = {
      ...argv,
      uploaderModules: JSON.parse(argv?.uploaderModules || '[]'),
    };
  }

  // 默认赋值
  configData.retryLimit = configData.retryLimit || 5;
  configData.maxConcurrent = configData.maxConcurrent || 10;
  configData.lastFile = configData.lastFile || "index.html";
  
  return configData; // 返回配置数据
}

function getConfigData() {
  return configData;
}

module.exports = {
    loadDefaultConfig,
    getConfigData
};
