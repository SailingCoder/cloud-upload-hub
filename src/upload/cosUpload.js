const COS = require("cos-nodejs-sdk-v5");
const path = require("path");
const fs = require("fs");

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
  }

  async uploadFile(files) {
    const tasks = files.map((file) => () => this.uploadSingleFileWithRetry(file));
    await this.runConcurrentLimit(tasks, this.concurrencyLimit); // 先并发上传其它文件
  }

  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      await this.uploadSingleFile(file);
    } catch (error) {
      if (retryCount < this.maxRetryCount) {
        console.log(`上传COS失败，正在重试 ${file}，重试次数：${retryCount + 1}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`文件上传COS失败：${file}，错误：`, error);
        throw error;
      }
    }
  }

  async uploadSingleFile(file) {
    const fileName = path.basename(file);
    const targetPath = path.join(this.uploadTo, fileName);

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

  async runConcurrentLimit(tasks, limit) {
    const taskQueue = [];
    while (tasks.length > 0) {
      while (taskQueue.length < limit && tasks.length > 0) {
        const task = tasks.shift();
        const taskPromise = task().finally(() => taskQueue.splice(taskQueue.indexOf(taskPromise), 1));
        taskQueue.push(taskPromise);
      }
      await Promise.race(taskQueue); // 等待最先完成的任务
    }
    await Promise.all(taskQueue); // 确保剩余的任务都完成
  }
}

module.exports = { UploadCos };
