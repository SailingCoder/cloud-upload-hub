const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const { BaseUploader } = require('../upload/baseUploader')
const { registerUploader } = require('../upload/uploaderRegistry')

class UploadCos extends BaseUploader {
  constructor(options) {
    super(options); // 调用基类构造函数
    this.client = new COS({
      SecretId: options.SecretId,
      SecretKey: options.SecretKey,
    });
    this.Bucket = options.Bucket;
    this.Region = options.Region;
    this.headers = options.headers || {};
  }

  async uploadSingleFile(file, target) {
    try {
      const result = await this.client.putObject({
        Bucket: this.Bucket,
        Region: this.Region,
        Key: target,
        Body: fs.createReadStream(file),
        Headers: this.headers,
      });
      return {
        success: result.statusCode === 200,
        status: result.statusCode,
        // message: `文件 ${file} 上传成功到 ${target}`, 默认: `${file} -> ${target}`
        extra: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// 设置 COS 上传器
registerUploader(UploadCos, {
  configName: 'cosCredentials', // 配置文件名
  configRequiredFields: ['Bucket', 'SecretKey', 'SecretId', 'Region'], // 必填字段
  headerName: 'cosHeaders', // 头部配置
  type: 'COS', // 上传器类型
})
