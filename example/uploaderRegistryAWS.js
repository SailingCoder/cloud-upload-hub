// 代码例子，可按照下面的代码进行修改。（代码就按照这个复制、粘贴，改改）
// 然后在命令行执行, 即可上传文件到阿里云 AWS
/*
"scripts": {
  "uploaderossCopy:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=sailing/test  --customConfigPaths='[\"./awsUpload.js\"]' --awsConfig=./config/aws.test.conf.json",
},
*/
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
    this.headers = options.headers || {}; // 选填
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    const params = {
      Bucket: this.bucket,
      Key: targetPath,
      Body: file,
      ACL: 'public-read', // 可根据需要修改 ACL
      ContentType: 'application/octet-stream', // 可根据需要修改 ContentType
      ...this.headers, // 选填
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        success: true, // 必填字段
        status: 200, // 必填字段
        // message: `文件 ${file} 上传成功到 ${result.Location}`,
        // extra: result, // 选填
      };
    } catch (error) {
      return {
        success: false, // 必填字段
        status: error.statusCode, // 必填字段
        message: error.message, // 必填字段
      };
    }
  }
}

// 设置 AWS S3 上传器
registerUploader(UploadAwsS3, {
    configName: 'awsConfig', // 配置文件名，与命令行对应, 必填
    configRequiredFields: ['bucket', ' accessKeyId', 'secretAccessKey', 'region'], // 必填
    // headerName: 'awsHeaders', // 头部配置, 选填
    type: 'AWS', // 上传器类型, 必填
})
