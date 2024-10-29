const path = require('path')
const { runConcurrentLimit } = require('../utils/tasks')

class BaseUploader {
  constructor(options) {
    this.uploadFrom = options.uploadFrom;
    this.uploadTo = options.uploadTo;
    this.maxRetryCount = options.maxRetryCount || 5;
    this.concurrencyLimit = options.concurrencyLimit || 10; // 并发上传数量控制
    this.successTotal = 0;
    this.fileTotal = options.fileTotal || 0
    this.type = options.type
  }

  async uploadFile(files) {
    const tasks = files.map((file) => () => this.uploadSingleFileWithRetry(file));
    await runConcurrentLimit(tasks, this.concurrencyLimit); // 控制并发上传
  }

  setFileTotal(total) {
    this.fileTotal = total;
  }

  // 上传单个文件，并增加重试机制
  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      const targetPath = path.join(this.uploadTo, file);
      const result = await this.uploadSingleFile(file, targetPath);
      if (result?.success) {
        this.successTotal++;
        const msg = result?.message ? result?.message : `${file} -> ${targetPath}`;
        console.log(`[${this.type}][SUCCESS][${this.successTotal}/${this.fileTotal}]${retryCount ? `(${retryCount + 1})`: ''}: ${msg}`)
      } else {
        throw new Error(`status：${result?.status}${result?.message ? `, message：${result.message}` : ''}`);
      }
    } catch (error) {
      if (retryCount < this.maxRetryCount) {
        console.warn(`[${this.type}][WARN]: 上传异常，正在重试上传，重试次数：${retryCount + 1}，文件: ${file}`);
        // console.warn(`[OSS][WARN]: 上传 OSS 异常，正在重试 ${file}，重试次数：${retryCount + 1}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`[${this.type}][ERROR]: 上传失败，文件: ${file}，errorMsg：`, error.message);
        throw error;
      }
    }
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    throw new Error("uploadSingleFile 方法未实现"); // 子类需要实现该方法
  }
}

module.exports = { BaseUploader }
