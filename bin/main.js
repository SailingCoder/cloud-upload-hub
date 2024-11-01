#!/usr/bin/env node
const { displayHelp } = require("../src/utils/file");
const { runLoadConfig } = require('../src/upload/loadConfig');
const { runUpload } = require('../src/upload/uploaderData');
const { loadDefaultConfig } = require('../src/store/config');

// 如果用户输入 --help，显示命令使用说明
if (argv.help) {
  displayHelp();
  process.exit(0);
}

run()

function run() {
  try {
    runLoadConfig(); // 加载配置
    runUpload(); // 执行上传
  } catch (error) {
    // console.log("上传过程中发生错误:", error.message);
  }
}

// 加载配置文件
function runLoadConfig() {
  try {
    // 获取命令行参数
    const configData = loadDefaultConfig();

    // 静态加载上传器
    require("../modules/cosUpload.js");
    require("../modules/ossUpload.js");

    // 动态加载上传器
    loadUploadModules(configData.uploaderModules);
  } catch (error) {
    console.error("加载配置文件失败:", error);
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
    console.error("加载上传器配置文件失败:", error);
    process.exit(1);
  }
}
