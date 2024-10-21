const COS = require("cos-nodejs-sdk-v5");
const path = require("path");
const fs = require("fs");
const cwd = process.cwd(); // 命令执行所在目录

class UploadCos {
  constructor({
    Bucket,
    Region,
    SecretId,
    SecretKey,
    uploadFrom,
    uploadTo,
    maxRetryCount,
    headers,
  }) {
    this.Bucket = Bucket;
    this.Region = Region;
    this.uploadFrom = uploadFrom;
    this.uploadTo = uploadTo;
    this.allFiles = [];
    this.totalFileNum = 0;
    this.successFileNum = 0;
    this.failFileNum = 0;
    this.maxRetryCount = maxRetryCount || 5;
    this.headers = headers;

    this.client = new COS({
      SecretId,
      SecretKey,
    });
  }

  uploadFile() {
    if (!this.uploadFrom || !this.uploadTo) {
      throw new Error("【uploadFrom】【uploadTo】 为必传参数");
    }
    const dir = path.join(cwd, this.uploadFrom);
    const isDirectory = fs.statSync(dir).isDirectory();

    if (!isDirectory) {
      this.totalFileNum = 1;
      return this.putCos(this.uploadTo, this.uploadFrom);
    }

    this.getFileList(this.uploadFrom);
    this.totalFileNum = this.allFiles.length;
    console.log(`共扫描了${this.totalFileNum}个文件`);

    this.allFiles.forEach((file) => {
      const cosPath = file.replace(this.uploadFrom, this.uploadTo);
      this.putCos(cosPath, file);
    });
  }

  getFileList(dir) {
    const arr = fs.readdirSync(dir);
    arr.forEach((item) => {
      const fullpath = path.join(dir, item);
      const stats = fs.statSync(fullpath);
      if (stats.isDirectory()) {
        this.getFileList(fullpath);
      } else {
        this.allFiles.push(fullpath);
      }
    });
  }

  putCos(cosPath, localPath, requestCount = 1) {
    return new Promise((resolve, reject) => {
      this.client.putObject(
        {
          Bucket: this.Bucket,
          Region: this.Region,
          Key: cosPath,
          Body: fs.createReadStream(localPath),
        },
        (err, data) => {
          if (err) {
            console.log(`第${requestCount}次上传失败: ${localPath}`);
            if (requestCount >= this.maxRetryCount) {
              this.failFileNum++;
              this.checkUploadStatus();
              reject(err);
            } else {
              this.putCos(cosPath, localPath, ++requestCount)
                .then(resolve)
                .catch(reject);
            }
          } else {
            this.successFileNum++;
            console.log(`第${requestCount}次上传成功: ${localPath}`);
            this.checkUploadStatus();
            resolve(data);
          }
        }
      );
    });
  }

  checkUploadStatus() {
    if (this.successFileNum + this.failFileNum === this.totalFileNum) {
      console.log(
        `======上传结束，共上传${this.totalFileNum}个，成功${this.successFileNum}个，失败${this.failFileNum}个======`
      );
    }
  }
}

module.exports = { UploadCos };
