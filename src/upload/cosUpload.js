const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const { BaseUploader } = require('./baseUploader')
const { registerUploader } = require('./uploaderRegistry')

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

  async uploadSingleFile(file, targetPath) {
    try {
      const result = await this.client.putObject({
        Bucket: this.Bucket,
        Region: this.Region,
        Key: targetPath,
        Body: fs.createReadStream(file),
        Headers: this.headers,
      });
      return {
        success: result.statusCode === 200,
        status: result.statusCode,
        // message: `文件 ${file} 上传成功到 ${targetPath}`, 默认: `${file} -> ${targetPath}`
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
  configName: 'cosConfig', // 配置文件名
  configRequiredFields: ['Bucket', 'SecretKey', 'SecretId', 'Region'], // 必填字段
  headerName: 'cosHeaders', // 头部配置
  type: 'COS', // 上传器类型
})
