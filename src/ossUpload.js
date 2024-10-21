const OSS = require('ali-oss')
const path = require('path')
const fs = require('fs')

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
    this.lastFile = options.lastFile || "index.html"; // 指定优先级文件（默认 index.html）
  }

  async uploadFile() {
    const files = this.getFiles(this.uploadFrom);
    console.log(`共扫描了${files.length}个文件，准备上传到OSS...`);

    const [lastFile, otherFiles] = this.separatelastFile(files);
    
    // 先上传非优先文件
    const tasks = otherFiles.map((file) => () => this.uploadSingleFileWithRetry(file));
    await this.runConcurrentLimit(tasks, this.concurrencyLimit); // 控制并发上传
    
    // 最后上传指定的优先文件
    if (lastFile) {
      console.log(`最后上传到OSS的文件：${lastFile}`);
      await this.uploadSingleFileWithRetry(lastFile); // 上传 index.html
    }
  }

  // 获取所有待上传的文件
  getFiles(dir) {
    let fileList = [];
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fileList = fileList.concat(this.getFiles(filePath));
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  // 分离出优先上传的文件
  separatelastFile(files) {
    let lastFile = null;
    const otherFiles = files.filter((file) => {
      const isPriority = file.endsWith(this.lastFile);
      if (isPriority) {
        lastFile = file;
      }
      return !isPriority;
    });
    return [lastFile, otherFiles];
  }

  // 上传单个文件，并增加重试机制
  async uploadSingleFileWithRetry(file, retryCount = 0) {
    try {
      await this.uploadSingleFile(file);
    } catch (error) {
      if (retryCount < this.maxRetryCount) {
        console.log(`上传OSS失败，正在重试 ${file}，重试次数：${retryCount + 1}`);
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
    await this.client.put(targetPath, file, {
      headers: this.headers,
    });
  }

  // 并发控制的核心逻辑
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

module.exports = { UploadAliOss }
