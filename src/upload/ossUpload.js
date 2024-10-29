const OSS = require('ali-oss')
const { BaseUploader } = require('./baseUploader')
const { registerUploader } = require('./uploaderRegistry')
class UploadAliOss extends BaseUploader {
  constructor(options) {
    super(options); // 调用基类构造函数
    this.client = new OSS({
      region: options.region,
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
    });
    this.headers = options.headers || {};
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    try {
      const result = await this.client.put(targetPath, file, {
        headers: this.headers,
      });
      return {
        success: result?.res?.status === 200,
        status: result?.res?.status,
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

// 设置 OSS 上传器
registerUploader(UploadAliOss, {
  configName: 'ossConfig', // 配置文件名
  configRequiredFields: ['bucket', 'accessKeyId', 'accessKeySecret', 'region'], // 必填字段
  headerName: 'ossHeaders', // 头部配置
  type: 'OSS', // 上传器类型
})
