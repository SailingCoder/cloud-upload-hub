const path = require('path')
const { runConcurrentLimit } = require('../utils/process')
const { formatTime } = require('../utils/time')

class BaseUploader {
  constructor(options) {
    this.source = options.source;
    this.target = options.target;
    this.retryLimit = options.retryLimit || 5;
    this.maxConcurrent = options.maxConcurrent || 20; // 并发上传数量控制
    this.successTotal = 0;
    this.fileTotal = options.fileTotal || 0;
    this.type = options.type;
    this.format = options.format || '';
  }

  async uploadFile(files) {
    const tasks = files.map((file) => () => this.uploadSingleFileWithRetry(file));
    await runConcurrentLimit(tasks, this.maxConcurrent); // 控制并发上传
  }

  setFileTotal(total) {
    this.fileTotal = total;
  }
  
  getUploaderType() {
    return this.type
  }

  // 上传单个文件，并增加重试机制
  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      const target = path.join(this.target, path.relative(this.source, file));
      const result = await this.uploadSingleFile(file, target);
      if (result?.success) {
        this.successTotal++;
        const msg = result?.message ? result?.message : `${file} -> ${target}`;
        const createTime = this.format ? formatTime(this.format) : new Date().toISOString();
        console.log(`[${this.type}][OK][${this.successTotal}/${this.fileTotal}][${createTime}]${retryCount ? `(${retryCount + 1})`: ''}: ${msg}`)
      } else {
        const messages = [];
        if (result?.status) {
          messages.push(`status: ${result.status}`);
        }
        if (result?.message) {
          messages.push(`${result.message}`);
        }
        throw new Error(messages.length > 0 ? messages.join(', ') : '未知错误');
      }
    } catch (error) {
      const createTime = this.format ? formatTime(this.format) : new Date().toISOString();
      if (retryCount < this.retryLimit) {
        console.warn(`[${this.type}][WARN][${createTime}]: 上传异常，正在重试 #${retryCount + 1}，文件: ${file}`);
        // console.warn(`[OSS][WARN]: 上传 OSS 异常，正在重试 ${file}，重试次数：${retryCount + 1}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`[${this.type}][ERROR][${createTime}]: 上传失败，文件: ${file}, message：${error.message}`);
        throw error;
      }
    }
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, target) {
    throw new Error("uploadSingleFile 方法未实现"); // 子类需要实现该方法
  }
}

module.exports = { BaseUploader }
