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


runUpload();

async function runUpload() {
  const uploaderType = [];
  const uploaders = [];
  const lastFileUploaders = [];

  if (!uploadFrom || !uploadTo) {
    console.error("请提供【uploadFrom】和【uploadTo】参数进行上传。");
    process.exit(1); // 退出程序
  }
  
  if (!argv.ossConfig && !argv.cosConfig) {
    console.error("请提供【ossConfig】或【cosConfig】进行上传。");
    process.exit(1); // 退出程序
  }

  // 获取所有待上传的文件
  const files = getUploadFiles(uploadFrom);
  if (files.length === 0) {
    console.log("没有找到待上传的文件");
    process.exit(0); // 退出程序
  }
  console.log(`共扫描了${files.length}个文件，准备上传...`);

  // 分离出最后上传的文件
  const [lastFile, otherFiles] = separatelastFile(files, lastFileName);

  // OSS 上传
  if (argv.ossConfig) {
    const ossConfig = loadConfig(argv.ossConfig);
    validateConfig(ossConfig, ['bucket', 'accessKeyId', 'accessKeySecret', 'region'], 'OSS');

    const headers = (argv.headers || argv.ossHeaders) ? JSON.parse(argv.ossHeaders) : {}; // 解析自定义头部

    const ossUploader = new UploadAliOss({
      bucket: ossConfig.bucket,
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      region: ossConfig.region,
      uploadFrom,
      uploadTo,
      maxRetryCount,
      headers,
      concurrencyLimit, // 传递并发限制
    });
    uploaderType.push("OSS");
    uploaders.push(ossUploader.uploadFile(otherFiles));
    if (lastFile) {
      lastFileUploaders.push(ossUploader.uploadSingleFileWithRetry(lastFile));
    }
  }

  // COS 上传
  if (argv.cosConfig) {
    const cosConfig = loadConfig(argv.cosConfig);
    validateConfig(cosConfig, ['Bucket', 'SecretKey', 'SecretId', 'Region'], 'COS');

    const headers = (argv.headers || argv.cosHeaders) ? JSON.parse(argv.cosHeaders) : {}; // 解析自定义头部

    const cosUploader = new UploadCos({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      SecretId: cosConfig.SecretId,
      SecretKey: cosConfig.SecretKey,
      uploadFrom,
      uploadTo,
      maxRetryCount,
      headers,
      concurrencyLimit, // 传递并发限制
    });
    uploaderType.push("COS");
    uploaders.push(cosUploader.uploadFile(otherFiles));
    if (lastFile) {
      lastFileUploaders.push(cosUploader.uploadSingleFileWithRetry(lastFile));
    }
  }

  try {
    // 等待所有上传操作完成
    await Promise.all(uploaders);
    await Promise.all(lastFileUploaders);
    console.log(`所有文件已成功上传至: ${uploaderType.join(", ")}`);
  } catch (error) {
    console.error("上传过程中发生错误:", err);
  }
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