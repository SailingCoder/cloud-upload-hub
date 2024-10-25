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
  }

  async uploadFile(files) {
    const tasks = files.map((file) => () => this.uploadSingleFileWithRetry(file));
    await runConcurrentLimit(tasks, this.concurrencyLimit); // 控制并发上传
  }

  // 上传单个文件，并增加重试机制
  async uploadSingleFileWithRetry(file, retryCount = 1) {
    try {
      const result = await this.uploadSingleFile(file);
      if (result?.res?.status === 200) {
        console.log(`第${retryCount}次上传成功:  ${file}`)
      } else {
        throw new Error(`上传OSS失败，状态码：${result?.res?.status}，文件：${file}`);
      }
    } catch (error) {
      if (retryCount <= this.maxRetryCount) {
        console.log(`上传OSS失败，正在重试 ${file}，重试次数：${retryCount}`);
        await this.uploadSingleFileWithRetry(file, retryCount + 1);
      } else {
        console.error(`文件上传OSS失败：${file}，错误：`, error);
        throw error;
      }
    }
  }

  // 实际的文件上传函数
  async uploadSingleFile(file) {
    const fileName = path.basename(file);
    const targetPath = path.join(this.uploadTo, fileName);

    // console.log(`正在上传OSS：${file} -> ${targetPath}`);
    return await this.client.put(targetPath, file, {
      headers: this.headers,
    });
  }
}

module.exports = { UploadAliOss }
