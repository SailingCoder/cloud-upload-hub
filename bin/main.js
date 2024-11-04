#!/usr/bin/env node
const { displayHelp } = require("../src/utils/file");
const { loadUploadFiles, uploadFiles, uploadLastFile } = require('../src/upload/uploaderData');
const { loadDefaultConfig } = require('../src/store/config');
const { getArgv } = require('../src/utils/process');

// 如果用户输入 --help，显示命令使用说明
if (getArgv().help) {
  displayHelp();
  process.exit(0);
}

runUpload()

async function runUpload() {
  try {
    runLoadConfig(); // 加载配置
    // 执行上传
    const [files, lastFile, otherFiles] = await loadUploadFiles();

    console.log(`====== 共扫描了${files.length}个文件，开始上传资源文件。 ======\n`);
    await uploadFiles(otherFiles, files);

    if (lastFile) {
        console.log(`====== 开始上传生效文件。 ====== \n`);
        await uploadLastFile(lastFile);
    }

    console.log(`====== 文件上传完成 ======`);
    if (configData.onSuccess && typeof configData.onSuccess === "function") {
        configData.onSuccess();
    }
  } catch (error) {
    if (error.code === 1) {
      console.error("【error】资源准备阶段", error.message);
    } else if (error.code === 2) {
      console.error("【error】资源文件上传阶段", error.message);
    } else if (error.code === 3) {
      console.error("【error】生效文件上传阶段", error.message);
    } else if (error.code === 4) {
      console.error("【error】加载配置文件:", error.message);
    } else {
      console.error("【error】未知错误:", error.message);
    }
    if (configData.onUploadFail && typeof configData.onUploadFail === "function") {
      configData.onUploadFail(error.code, error.message);
    }
  }
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
    throw {
      code: 4,
      message: `${error.message}`,
    };
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
    throw new Error(`动态加载上传器失败, ${error.message}`);
  }
}
