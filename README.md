# multi-cloud-uploader - 轻量级前端多云上传库

**multi-cloud-uploader** 是一个轻量级的前端资源 Node 上传库，专为多云存储平台的文件上传而设计。它目前支持阿里云 OSS 和腾讯云 COS，也支持动态扩展其他云存储上传能力，未来将扩展到更多云存储服务。

这个库的目的是通过简洁的 API，开发者可以轻松集成多个云平台的文件上传功能，无需重复实现不同平台的逻辑。

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[English Documentation](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/doc/README_EN.md)

### 特性

*   **多种云存储支持**：支持 OSS、COS 等，用户可动态选择单个或多个上传。
*   **动态加载配置**：通过 customConfigPaths 参数配置其他私有云或公有云的上传（支持扩展）。
*   **易于扩展**：未来将支持更多云存储，如 AWS S3 和 Google Cloud Storage。
*   **简化集成**：统一接口，简化文件上传流程。
*   **请求头配置**：支持 OSS 和 COS 的独立请求头配置。
*   **指定最后上传的文件**：默认支持 `index.html`。
*   **重试机制**：自动重试上传，确保可靠性。

## 安装

通过 npm 安装此工具：

```bash
npm install multi-cloud-uploader --save-dev 
```

## 使用方法

### 命令行示例

要使用 multi-cloud-uploader，可以通过命令行运行以下命令：

```bash
multi-cloud-uploader --uploadFrom=<源目录> --uploadTo=<目标目录> --ossConfig=<oss配置文件>
```

### 示例

上传文件到测试目录的示例：

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json 
```

在 package.json 配置示例：

```json
"scripts": {
  "uploader:tice": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/tice --ossConfig=./config/oss.tice.conf.json",
  "uploader:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./config/oss.test.conf.json",
  "uploader:gray": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/gray --ossConfig=./config/oss.gray.conf.json",
  "uploader:prod": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/prod --ossConfig=./config/oss.prod.conf.json"
}
```

执行命令：

```bash
npm run uploader:tice
```

### 参数说明

*   `--ossConfig`: 阿里云 OSS 配置文件路径（JSON格式），需包含 `bucket`、`accessKeyId`、`accessKeySecret` 和 `region`。
*   `--cosConfig`: 腾讯云 COS 配置文件路径（JSON格式），需包含 `Bucket`、`SecretId`、`SecretKey` 和 `Region`。
*   `--uploadFrom`: 指定要上传的本地目录或文件路径。
*   `--uploadTo`: 上传到 OSS 或 COS 的目标路径。
*   `--lastFile`: 最后上传的文件（默认 `index.html`）。
*   `--maxRetryCount`: 最大重试次数（默认为5）。
*   `--concurrency`: 并发上传数量限制（默认为10）。
*   `--headers`: 自定义请求头（JSON格式）。
*   `--customConfigPaths`: 自定义配置文件路径（JSON格式数组）。
*   `--ossHeaders`: OSS 请求头（JSON格式）。
*   `--cosHeaders`: COS 请求头（JSON格式）。

### 配置文件路径 

以阿里云OSS配置（[ossConfig.json](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example/config)）为例：

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### 显示帮助信息

```bash
multi-cloud-uploader --help
```

## 自定义配置加载 customConfigPaths

可以通过 `customConfigPaths` 参数，用户可以动态加载特定的上传器（除OSS、COS之外）配置文件，以满足不同的上传需求。该参数为 JSON 格式数组，可以包含多个配置文件路径。

### 命令行示例

```bash
multi-cloud-uploader --uploadFrom=<源目录> --uploadTo=<目标目录> --customConfigPaths='[<配置文件路径1>, <配置文件路径2>]' --ossConfig=<oss配置文件>
```

例如：

```bash
"uploader:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./upload/ossUpload.js\"]' --ossConfig=./oss.tice.conf.json",
```

### 配置步骤

以 OSS 为例，代码示例：（代码就按照这个复制、粘贴，改改）[代码示例](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example)

1、代码编写

[./example/uploaderRegistryOSS.js](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example/uploaderRegistryOSS.js):

```js
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
```

2、package.json设置

单存储上传

```json
"scripts": {
  "uploaderRegistryOSS:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./example/uploaderRegistryOSS.js\"]' --ossCopyConfig=./config/oss.tice.conf.json"
}
```

多存储上传：也可以和该库自带的 OSS 和 COS 共同上传。

```json
"scripts": {
  "uploaderRegistryOSS:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./example/uploaderRegistryOSS.js\"]' --ossCopyConfig=./config/oss.tice.conf.json --cosConfig=./config/cos.tice.conf.json"
}
```

3、oss.test.conf.json配置

./config/oss.test.conf.json

```json
{
    "bucket": "your-bucket-name",
    "accessKeyId": "your-access-key-id",
    "accessKeySecret": "your-access-key-secret",
    "region": "oss-cn-beijing"
}
```

4、执行命令

```bash
npm run uploaderRegistryOSS:tice
```

## 沟通

如有意见和问题，欢迎来[issues](https://github.com/SailingCoder/multi-cloud-uploader/issues)沟通。

## 许可证

该项目使用 [MIT 许可证](LICENSE)。