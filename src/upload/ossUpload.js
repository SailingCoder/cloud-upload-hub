const OSS = require('ali-oss')
const path = require('path')
const { runConcurrentLimit } = require('../utils/tasks')
class UploadAliOss {
  constructor(options) {
    this.client = new OSS({
      region: options.region,
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
    });
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
    await runConcurrentLimit(tasks, this.concurrencyLimit); // 控制并发上传
  }

  // 上传单个文件，并增加重试机制
  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      const targetPath = path.join(this.uploadTo, file);
      const result = await this.uploadSingleFile(file, targetPath);
      if (result?.res?.status === 200) {
        this.successTotal++;
        console.log(`[OSS][SUCCESS][${this.successTotal}/${this.fileTotal}]${retryCount ? `(${retryCount + 1})`: ''}: ${file} -> ${targetPath}`)
      } else {
        throw new Error(`上传OSS失败，状态码：${result?.res?.status}，文件：${file}`);
      }
    } catch (error) {
      if (retryCount < this.maxRetryCount) {
        // console.warn(`[OSS][WARN]: 上传 OSS 异常，正在重试 ${file}，重试次数：${retryCount + 1}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`[OSS][ERROR]: 上传 OSS 失败：${file}，错误：`, error);
        throw error;
      }
    }
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    // console.log(`正在上传OSS：${file} -> ${targetPath}`);
    return await this.client.put(targetPath, file, {
      headers: this.headers,
    });
  }
}

module.exports = { UploadAliOss }
