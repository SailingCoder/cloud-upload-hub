// example/awsUpload.js
const AWS = require('aws-sdk');
const { BaseUploader } = require('multi-cloud-uploader');

class UploadAwsS3 extends BaseUploader {
  constructor(options) {
    super(options); // 调用基类构造函数
    this.s3 = new AWS.S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region,
    });
    this.bucket = options.bucket;
    this.headers = options.headers || {};
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    const params = {
      Bucket: this.bucket,
      Key: targetPath,
      Body: file,
      ACL: 'public-read', // 可根据需要修改 ACL
      ContentType: 'application/octet-stream', // 可根据需要修改 ContentType
      ...this.headers,
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        success: true,
        status: 200,
        // message: `文件 ${file} 上传成功到 ${result.Location}`,
        extra: result,
      };
    } catch (error) {
      return {
        success: false,
        status: error.statusCode || 'unknown',
        message: error.message,
      };
    }
  }
}

// 设置 AWS S3 上传器
registerUploader(UploadAwsS3, {
    configName: 'awsConfig', // 配置文件名
    configRequiredFields: ['bucket', ' accessKeyId', 'secretAccessKey', 'region'], // 必填字段
    headerName: 'awsHeaders', // 头部配置
    type: 'AWS', // 上传器类型
})
