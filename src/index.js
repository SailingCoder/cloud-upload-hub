const path = require("path");
const fs = require("fs");
const minimist = require("minimist");
const { UploadAliOss } = require("./ossUpload.js");
const { UploadCos } = require("./cosUpload.js");

const cwd = process.cwd(); // 命令执行所在目录
const argv = minimist(process.argv.slice(2)); // 获取并解析传过来的参数

const uploaders = [];

// OSS 上传
if (argv.ossConfig) {
  const uploadFrom = argv.ossUploadFrom || argv.uploadFrom;
  const uploadTo = argv.ossUploadTo || argv.uploadTo;
  if (!uploadFrom || !uploadTo) {
    throw new Error("【uploadFrom】和【uploadTo】为必传参数");
  }

  const ossConfig = loadConfig(argv.ossConfig);
  const isValid =
    ossConfig.bucket &&
    ossConfig.accessKeyId &&
    ossConfig.accessKeySecret &&
    ossConfig.region;
  if (!isValid) {
    throw new Error("缺少 OSS 配置");
  }

  const headers = argv.ossHeaders ? JSON.parse(argv.ossHeaders) : {}; // 解析自定义头部

  const ossUploader = new UploadAliOss({
    bucket: ossConfig.bucket,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    region: ossConfig.region || "oss-cn-beijing",
    uploadFrom,
    uploadTo,
    maxRetryCount: argv.maxRetryCount || 5,
    headers,
  });
  uploaders.push(ossUploader.uploadFile());
}

// COS 上传
if (argv.cosConfig) {
  const uploadFrom = argv.cosUploadFrom || argv.uploadFrom;
  const uploadTo = argv.cosUploadTo || argv.uploadTo;

  if (!uploadFrom || !uploadTo) {
    throw new Error("【uploadFrom】和【uploadTo】为必传参数");
  }

  const cosConfig = loadConfig(argv.cosConfig);
  const isValid =
    cosConfig.Bucket &&
    cosConfig.SecretKey &&
    cosConfig.SecretId &&
    cosConfig.Region;
  if (!isValid) {
    throw new Error("缺少 COS 配置");
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
  });
  uploaders.push(cosUploader.uploadFile());
}

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
    throw new Error(`${configPath} 加载失败: ${error.message}`); // 直接抛出错误
  }
  return config;
}


// node index.js --ossConfig=config/ossConfig.json --ossUploadFrom=./localFile.txt --ossUploadTo=/remote/path/ --ossHeaders='{"x-my-header":"my-value"}' --cosConfig=config/cosConfig.json --cosUploadFrom=./localFile.txt --cosUploadTo=/remote/path/ --cosHeaders='{"x-my-header":"my-value"}'
// node index.js --ossConfig=config/ossConfig.json --ossUploadFrom=./localFile.txt --ossUploadTo=/remote/path/ --ossHeaders='{"x-my-header":"my-value"}' --cosConfig=config/cosConfig.json --cosUploadFrom=./localFile.txt --cosUploadTo=/remote/path/ --cosHeaders='{"x-my-header":"my-value"}'
