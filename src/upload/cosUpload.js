const COS = require("cos-nodejs-sdk-v5");
const path = require("path");
const fs = require("fs");
const { runConcurrentLimit } = require("../utils/tasks");

class UploadCos {
  constructor(options) {
    this.client = new COS({
      SecretId: options.SecretId,
      SecretKey: options.SecretKey,
    });
    this.Bucket = options.Bucket;
    this.Region = options.Region;
    this.uploadFrom = options.uploadFrom;
    this.uploadTo = options.uploadTo;
    this.maxRetryCount = options.maxRetryCount || 5;
    this.headers = options.headers || {};
    this.concurrencyLimit = options.concurrencyLimit || 10; // 并发上传数量控制
    this.successTotal = 0;
    this.fileTotal = options.fileTotal || 0
  }

  async uploadFile(files) {
    const tasks = files.map((file) => () => this.uploadSingleFileWithRetry(file));
    await runConcurrentLimit(tasks, this.concurrencyLimit); // 先并发上传
  }

  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      const targetPath = path.join(this.uploadTo, file);
      await this.uploadSingleFile(file, targetPath);
      this.successTotal++;
      console.log(`[COS][SUCCESS][${this.successTotal}/${this.fileTotal}]${retryCount ? `(${retryCount + 1})`: ''}: ${file} -> ${targetPath}`) // 添加成功日志
    } catch (error) {
      if (retryCount < this.maxRetryCount) {
        // console.warn(`[COS][ERROR]: 上传 COS 异常，正在重试 ${file}，重试次数：${retryCount + 1}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`[COS][ERROR]: 上传 COS 失败：${file}，错误：`, error);
        throw error;
      }
    }
  }

  async uploadSingleFile(file, targetPath) {
    // console.log(`正在上传COS：${file} -> ${targetPath}`);
    await new Promise((resolve, reject) => {
      this.client.putObject(
        {
          Bucket: this.Bucket,
          Region: this.Region,
          Key: targetPath,
          Body: fs.createReadStream(file),
          Headers: this.headers,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }
}

module.exports = { UploadCos };
