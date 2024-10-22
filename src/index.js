#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const minimist = require("minimist");
const { UploadAliOss } = require("./ossUpload.js");
const { UploadCos } = require("./cosUpload.js");

const cwd = process.cwd(); // 命令执行所在目录
const argv = minimist(process.argv.slice(2)); // 获取并解析传过来的参数

const uploaders = [];

if (!argv.ossConfig && !argv.cosConfig) {
  console.error("请提供【ossConfig】或【cosConfig】进行上传。");
  process.exit(1); // 退出程序
}

// 并发上传数控制，默认为 10
const concurrencyLimit = argv.concurrency || 10;

// OSS 上传
if (argv.ossConfig) {
  const uploadFrom = argv.ossUploadFrom || argv.uploadFrom;
  const uploadTo = argv.ossUploadTo || argv.uploadTo;
  if (!uploadFrom || !uploadTo) {
    throw new Error("OSS 上传需要提供【uploadFrom】和【uploadTo】参数。");
  }

  const ossConfig = loadConfig(argv.ossConfig);
  const isValid = ossConfig.bucket && ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.region;
  if (!isValid) {
    throw new Error("缺少 OSS 配置。请检查配置文件中的 bucket、accessKeyId、accessKeySecret 和 region 是否存在。");
  }

  const headers = argv.ossHeaders ? JSON.parse(argv.ossHeaders) : {}; // 解析自定义头部

  const ossUploader = new UploadAliOss({
    bucket: ossConfig.bucket,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    region: ossConfig.region,
    uploadFrom,
    uploadTo,
    maxRetryCount: argv.maxRetryCount || 5,
    headers,
    concurrencyLimit, // 传递并发限制
    lastFile: argv.lastFile || "index.html",
  });
  uploaders.push(ossUploader.uploadFile());
}

// COS 上传
if (argv.cosConfig) {
  const uploadFrom = argv.cosUploadFrom || argv.uploadFrom;
  const uploadTo = argv.cosUploadTo || argv.uploadTo;

  if (!uploadFrom || !uploadTo) {
    throw new Error("COS 上传需要提供【uploadFrom】和【uploadTo】参数。");
  }

  const cosConfig = loadConfig(argv.cosConfig);
  const isValid = cosConfig.Bucket && cosConfig.SecretKey && cosConfig.SecretId && cosConfig.Region;
  if (!isValid) {
    throw new Error("缺少 COS 配置。请检查配置文件中的 Bucket、SecretKey、SecretId 和 Region 是否存在。");
  }

  const headers = argv.cosHeaders ? JSON.parse(argv.cosHeaders) : {};

  const cosUploader = new UploadCos({
    Bucket: cosConfig.Bucket,
    Region: cosConfig.Region,
    SecretId: cosConfig.SecretId,
    SecretKey: cosConfig.SecretKey,
    uploadFrom,
    uploadTo,
    maxRetryCount: argv.maxRetryCount || 5,
    headers,
    concurrencyLimit, // 传递并发限制
    lastFile: argv.lastFile || "index.html",
  });
  uploaders.push(cosUploader.uploadFile());
}

// 等待所有上传操作完成
Promise.all(uploaders)
  .then(() => {
    console.log("所有上传操作完成");
  })
  .catch((err) => {
    console.error("上传过程中发生错误:", err);
  });

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

// 如果用户输入 --help，显示命令使用说明
if (argv.help) {
  console.log(`
    使用说明：
    --ossConfig        指定 OSS 配置文件路径。
    --cosConfig        指定 COS 配置文件路径。
    --uploadFrom       指定上传源文件夹路径。
    --uploadTo         指定上传目标路径。
    --maxRetryCount    指定最大重试次数（默认为5）。
    --ossHeaders       指定自定义OSS请求头信息（JSON格式）。
    --cosHeaders       指定自定义COS请求头信息（JSON格式）。
    --concurrency      指定并发上传的数量限制（默认为10）。
    --lastFile         最后一个上传的文件（默认为 index.html）。
    --ossUploadFrom    指定 OSS 上传源文件夹路径。
    --ossUploadTo      指定 OSS 上传目标路径。
    --cosUploadFrom    指定 COS 上传源文件夹路径。
    --cosUploadTo      指定 COS 上传目标路径。
    --help             显示帮助信息。
  `);
  process.exit(0);
}

// node index.js --ossConfig=config/ossConfig.json --ossUploadFrom=./localFile.txt --ossUploadTo=/remote/path/ --ossHeaders='{"x-my-header":"my-value"}' --cosConfig=config/cosConfig.json --cosUploadFrom=./localFile.txt --cosUploadTo=/remote/path/ --cosHeaders='{"x-my-header":"my-value"}'
// node index.js --ossConfig=config/ossConfig.json --ossUploadFrom=./localFile.txt --ossUploadTo=/remote/path/ --ossHeaders='{"x-my-header":"my-value"}' --cosConfig=config/cosConfig.json --cosUploadFrom=./localFile.txt --cosUploadTo=/remote/path/ --cosHeaders='{"x-my-header":"my-value"}'
// node index.js --ossConfig=ossConfig.json --uploadFrom=./dist --uploadTo=/static --lastFile=index.html
