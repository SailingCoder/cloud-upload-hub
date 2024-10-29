// 代码例子，可按照下面的代码进行修改。（代码就按照这个复制、粘贴，改改）
// 然后在命令行执行, 即可上传文件到阿里云 OSS
/*
"scripts": {
  "uploaderossCopy:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=sailing/test  --customConfigPaths='[\"./ossCopyUpload.js\"]' --ossCopyConfig=./config/oss.test.conf.json",
},
*/
const OSS = require('ali-oss')
const { BaseUploader, registerUploader } = require('multi-cloud-uploader');

class UploadCopyOss extends BaseUploader {
  constructor(options) {
    super(options); // 调用基类构造函数
    this.client = new OSS({
      region: options.region,
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
    });
    this.headers = options.headers || {}; // 选填
  }

  // 实际的文件上传函数
  async uploadSingleFile(file, targetPath) {
    try {
      const result = await this.client.put(targetPath, file, {
        headers: this.headers, // 选填
      });
      return {
        success: result?.res?.status === 200, // 必填字段
        status: result?.res?.status, // 必填字段
        // message: `文件 ${file} 上传成功到 ${targetPath}`, 默认: `${file} -> ${targetPath}` // 选填
        // extra: result,  // 选填
      };
    } catch (error) {
      return {
        success: false, // 必填字段
        message: error.message, // 必填字段
      };
    }
  }
}

// 设置 OSS 上传器
registerUploader(UploadCopyOss, {
  configName: 'ossCopyConfig', // 配置文件名，与命令行对应, 必填
  configRequiredFields: ['bucket', 'accessKeyId', 'accessKeySecret', 'region'], // 必填
  // headerName: 'ossCopyHeaders', // 头部配置, 选填
  type: 'ossCopy', // 上传器类型, 必填
})