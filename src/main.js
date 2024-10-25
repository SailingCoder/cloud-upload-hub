#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const minimist = require("minimist");
const { getUploadFiles, separatelastFile } = require("./utils/file.js")
const { UploadAliOss } = require("./upload/ossUpload.js");
const { UploadCos } = require("./upload/cosUpload.js");

const cwd = process.cwd(); // 命令执行所在目录
const argv = minimist(process.argv.slice(2)); // 获取并解析传过来的参数

const concurrencyLimit = argv.concurrency || 10; // 并发上传数控制，默认为 10
const lastFileName = argv.lastFile || "index.html"; // 默认最后上传的文件为 index.html
const maxRetryCount = argv.maxRetryCount || 5; // 最大重试次数，默认为 5
const uploadFrom = argv.uploadFrom;
const uploadTo = argv.uploadTo;

let ossUploader = null;
let cosUploader = null;

runUpload();

async function runUpload() {
  try {
    if (!uploadFrom || !uploadTo) {
      console.error("请提供【uploadFrom】和【uploadTo】参数进行上传。");
      process.exit(1); // 退出程序
    }
    
    if (!argv.ossConfig && !argv.cosConfig) {
      console.error("请提供【ossConfig】或【cosConfig】进行上传。");
      process.exit(1); // 退出程序
    }

    const files = getUploadFiles(uploadFrom);
    if (files.length === 0) {
      console.log("没有找到待上传的文件");
      process.exit(0);
    }
    const [lastFile, otherFiles] = separatelastFile(files, lastFileName);

    ossUploader = argv.ossConfig ? await setupOssUploader() : null;
    cosUploader = argv.cosConfig ? await setupCosUploader() : null;

    console.log(`======共扫描了${files.length}个文件，准备上传。======`);
    await uploadFiles(otherFiles, lastFile); // 上传所有文件
    await uploadLastFile(lastFile); // 上传最后一个生效文件
    console.log(`======全部文件上传成功(${files.length}个)======`);
  } catch (error) {
    console.error("上传过程中发生错误:", error);
  }
}

async function uploadFiles(otherFiles, lastFile) {
  if (ossUploader) {
    console.log("开始上传资源到 OSS...");
    await ossUploader.uploadFile(otherFiles);
    console.log(`OSS 上传完成，共上传了 ${otherFiles.length} 个资源。${lastFile ? `剩余 1 个生效文件` : ''}`);
  }

  if (cosUploader) {
    console.log("开始上传资源到 COS...");
    await cosUploader.uploadFile(otherFiles);
    console.log(`COS 上传完成，共上传了 ${otherFiles.length} 个资源。${lastFile ? `剩余 1 个生效文件` : ''}`);
  }
}

async function uploadLastFile(lastFile) {
  if (!lastFile) {
    return;
  }
  console.log(`开始上传最后一个生效文件: ${lastFile}`);

  const lastFileUploaders = [];
  if (ossUploader) {
    lastFileUploaders.push(ossUploader.uploadSingleFileWithRetry(lastFile));
  }
  if (cosUploader) {
    lastFileUploaders.push(cosUploader.uploadSingleFileWithRetry(lastFile));
  }

  try {
    await Promise.all(lastFileUploaders);
    console.log(`最后一个生效文件上传成功: ${lastFile}`);
  } catch (error) {
    console.error("最后一个生效文件上传失败:", error);
  }
}

// 设置 OSS 上传器
async function setupOssUploader() {
  const ossConfig = loadConfig(argv.ossConfig);
  validateConfig(ossConfig, ['bucket', 'accessKeyId', 'accessKeySecret', 'region'], 'OSS');
  const headers = (argv.headers || argv.ossHeaders) ? JSON.parse(argv.ossHeaders) : {};
  return new UploadAliOss({
    ...ossConfig,
    uploadFrom,
    uploadTo,
    maxRetryCount,
    headers,
    concurrencyLimit,
  });
}

// 设置 COS 上传器
async function setupCosUploader() {
  const cosConfig = loadConfig(argv.cosConfig);
  validateConfig(cosConfig, ['Bucket', 'SecretKey', 'SecretId', 'Region'], 'COS');
  const headers = (argv.headers || argv.cosHeaders) ? JSON.parse(argv.cosHeaders) : {};
  return new UploadCos({
    ...cosConfig,
    uploadFrom,
    uploadTo,
    maxRetryCount,
    headers,
    concurrencyLimit,
  });
}


function loadConfig(configPath) {
  let config = {};
  configPath = path.resolve(cwd, configPath);
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (error) {
    throw new Error(`${configPath} 配置文件加载失败: ${error.message}`); // 直接抛出错误
  }
  return config;
}

function validateConfig(config, requiredKeys, type='') {
  const missingKeys = requiredKeys.filter(key => !config[key]);
  if (missingKeys.length > 0) {
    console.error(`缺少${type}配置: 请检查配置文件中的 ${missingKeys.join(', ')} 是否存在。`);
    process.exit(1);
  }
}

// 如果用户输入 --help，显示命令使用说明
if (argv.help) {
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
  process.exit(0);
}