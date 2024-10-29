#!/usr/bin/env node
const minimist = require("minimist");
const { getUploadFiles, separatelastFile } = require("../src/utils/file")
const { registerUploader, uploaders } = require('../src/upload/uploaderRegistry');
const { BaseUploader } = require('../src/upload/baseUploader');

const argv = minimist(process.argv.slice(2)); // 获取并解析传过来的参数

const lastFileName = argv.lastFile || "index.html"; // 默认最后上传的文件为 index.html
const uploadFrom = argv.uploadFrom;
const uploadTo = argv.uploadTo;

// 加载上传器
require("../src/upload/cosUpload.js");
require("../src/upload/ossUpload.js");

// 如果用户输入 --help，显示命令使用说明
if (argv.help) {
  displayHelp();
  process.exit(0);
}

async function runUpload() {
  try {
    if (!uploadFrom || !uploadTo) {
      console.error("请提供【uploadFrom】和【uploadTo】参数进行上传。");
      process.exit(1); // 退出程序
    }

    if (uploaders.length === 0) {
      console.error("没有可用的上传器，请检查配置。");
      process.exit(1); // 退出程序
    }

    const files = getUploadFiles(uploadFrom);
    if (files.length === 0) {
      console.log("没有找到待上传的文件");
      process.exit(0);
    }
    const [lastFile, otherFiles] = separatelastFile(files, lastFileName);

    console.log(`====== 共扫描了${files.length}个文件，开始上传资源文件。 ======\n`);
    await uploadFiles(otherFiles, files); // 上传资源文件

    if (lastFile) {
      console.log(`====== 开始上传生效文件。 ====== \n`);
      await uploadLastFile(lastFile); // 上传生效文件
    }
    
    console.log(`\n====== 全部文件上传成功(${files.length}个) ======`);
  } catch (error) {
    console.error("[error]: 上传过程中发生错误:", error);
  }
}

async function uploadFiles(otherFiles, files) {
  for (const uploader of uploaders) {
    await uploader.setFileTotal(files.length);
    await uploader.uploadFile(otherFiles);
    console.log("");
  }
}

async function uploadLastFile(lastFile) {
  if (!lastFile) {
    return;
  }
  try {
    const lastFileUploadPromises = uploaders.map(uploader => uploader.uploadSingleFileWithRetry(lastFile));
    await Promise.all(lastFileUploadPromises);
  } catch (error) {
    console.error("最后一个生效文件上传失败:", error);
  }
}

runUpload();

// 提取的帮助信息函数
function displayHelp() {
  console.log(`
    使用说明：
    --ossConfig        指定 OSS 配置文件路径。
    --cosConfig        指定 COS 配置文件路径。
    --uploadFrom       指定上传源文件夹路径。
    --uploadTo         指定上传目标路径。
    --maxRetryCount    指定最大重试次数（默认为5）。
    --concurrency      指定并发上传的数量限制（默认为10）。
    --lastFile         最后一个上传的文件（默认为 index.html）。
    --headers          指定自定义请求头信息（JSON格式）。
    --ossHeaders       指定自定义OSS请求头信息（JSON格式）。
    --cosHeaders       指定自定义COS请求头信息（JSON格式）。
    --help             显示帮助信息。
  `);
}

module.exports = { registerUploader, BaseUploader };