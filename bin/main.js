#!/usr/bin/env node
const { displayHelp } = require("../src/utils/file");
const { runUpload } = require('../src/upload/uploaderData');
const { loadDefaultConfig } = require('../src/store/config');
const { getArgv } = require('../src/utils/process');

// 如果用户输入 --help，显示命令使用说明
if (getArgv().help) {
  displayHelp();
  process.exit(0);
}

run()

function run() {
  runLoadConfig(); // 加载配置
  runUpload(); // 执行上传
}

// 加载配置文件
function runLoadConfig() {
  try {
    // 获取命令行参数
    const configData = loadDefaultConfig();

    // 静态加载上传器
    require("../src/modules/cosUpload.js");
    require("../src/modules/ossUpload.js");

    // 动态加载上传器
    loadUploadModules(configData.uploaderModules);
  } catch (error) {
    console.error("【error】加载配置文件:", error.message);
    if (config.onUploadFail && typeof config.onUploadFail === "function") {
      config.onUploadFail(4, error.message);
    }
    process.exit(1);
  }
}

// 加载上传器配置文件
async function loadUploadModules(paths = []) {
  try {
    for (const path of paths) {
      if (typeof path === 'function') { // 执行函数
        path(); 
      } else if (typeof path === 'string') { // 加载配置文件，执行函数
        require(resolveConfigPath(cpath)); 
      }
    }
  } catch (error) {
    throw new Error(`加载上传器配置文件失败, ${error.message}`);
  }
}
