# cloud-upload-hub

![npm version](https://img.shields.io/npm/v/cloud-upload-hub)

一个轻量级的前端多云存储上传工具，支持阿里云 OSS、腾讯云 COS 等云存储服务，提供统一的接口和灵活的配置选项。

这个库的目的是通过简洁的 API，开发者可以轻松集成多个云平台的文件上传功能，无需重复实现不同平台的逻辑。

## 特性

*   🚀 **多云支持**：支持阿里云 OSS、腾讯云 COS 等云存储服务
*   🔄 **灵活配置**：支持命令行参数和配置文件两种方式
*   🛠 **易于扩展**：支持自定义上传器，轻松扩展其他云存储服务
*   📊 **进度监控**：实时显示上传进度和状态
*   🔄 **自动重试**：内置重试机制，提高上传可靠性
*   📦 **轻量级**：零依赖，体积小巧
*   🚀 **简化集成**：统一接口，简化文件上传流程。
*   🛠 **请求头配置**：支持 OSS 和 COS 的独立请求头配置。
*   🛠 **指定最后上传的文件**：默认 `index.html`。

## 📦 安装

```bash
npm install cloud-upload-hub --save-dev 
```

## 🚀 快速开始

### 1. 命令行方式

```bash
# 基础用法
cloud-upload-hub --source=dist --target=my-project --ossCredentials=./config/oss.conf.json

# 使用配置文件
cloud-upload-hub --config=./uploader.config.js --mode=test
或根目录下
cloud-upload-hub --mode=test
```

### 2. 配置文件方式

创建 `uploader.config.js`：通过配置文件集中管理上传参数。这种方式适合长期项目或需要频繁上传的场景。

**配置示例**：

```js
const defineConfig = ({ mode }) => {
  return {
    source: 'src',  // 上传源路径
    target: gettarget(mode),  // 上传目标路径，根据 mode 动态获取
    retryLimit: 5,  // 重试次数
    maxConcurrent: 10,  // 最大并发量
    lastFile: 'index.html',  // 最后一个文件
    ossCredentials: './config/oss.tice.conf.json',  // OSS 配置文件(密钥)
    cosCredentials: async () => ({ // COS 配置
       SecretId: 'xxx',
       SecretKey: 'xxx'
       ...
    }),
    uploaderModules: [], // 自定义上传模块路径或注入函数
    onUploadSuccess(status) {
      console.log('上传成功:', status);
    },
    onUploadFail(status) {
      console.error('上传失败:', status);
    }
  };
};

export default defineConfig;
```

## 参数说明

以下是常用参数及其说明：

| 参数名                 | 说明                                                                               | 是否必传 | 命令行支持 | 配置文件支持 |
| ------------------- | -------------------------------------------------------------------------------- | ---- | ----- | --------------------- |
| **source**          | 指定要上传的本地目录或文件路径，例如 `dist`。                                                       | 是    | 是     | 是                     |
| **target**          | 上传到 OSS 或 COS 的目标路径，例如 `projectName/test`。                                       | 是    | 是     | 是                     |
| **ossCredentials**  | 阿里云 OSS 配置文件路径（JSON 格式），需包含 `bucket`、`accessKeyId`、`accessKeySecret` 和 `region`。 | 在没有配置`uploaderModules`时，`ossCredentials`与`cosCredentials`二选一必传    | 是     | 是                     |
| **cosCredentials**  | 腾讯云 COS 配置，支持异步获取，需返回 `SecretId` 和 `SecretKey`。                                  | 在没有配置`uploaderModules`时，`ossCredentials`与`cosCredentials`二选一必传    | 是     | 是                     |
| **retryLimit**      | 最大重试次数（默认为5），在上传失败时进行重试。                                                         | 否    | 是     | 是                     |
| **maxConcurrent**   | 并发上传数量限制（默认为10），控制同时上传的文件数量。                                                     | 否    | 是     | 是                     |
| **lastFile**        | 最后上传的文件（默认 `index.html`），指定上传顺序中的最后文件。                                           | 否    | 是     | 是                     |
| **uploaderModules** | 自定义上传模块配置，可以加载其他上传逻辑。                                                            | 否    | 是     | 是                     |
| **onUploadSuccess** | 上传成功的回调函数，接收上传状态。                                                                | 否    | 否     | 是                     |
| **onUploadFail**    | 上传失败的回调函数，接收失败状态。  onUploadFail(status<1:资源上传前；2：资源文件上传过程中；3：生效文件上传过程中；4：加载配置文件; 0: 未知错误>, message)                                                              | 否    | 否     | 是                     |

### 云存储配置


**uploader.config.js** 支持三种模式：

1.  配置文件路径：指定 OSS 或 COS 的配置文件路径。
    ```js
    ossCredentials: './config/oss.tice.conf.json', 
    ```
3.  配置对象：直接在配置中以对象形式提供相关凭据。
    ```js
    ossCredentials: {
        SecretId: 'xxx',  // COS的秘密ID
        SecretKey: 'xxx',  // COS的秘密密钥
        ...
    }, 
    ```
5.  异步函数：Promise 下的接口请求返回数据对象：通过异步接口请求返回的对象来提供凭据。
    ```js
    ossCredentials: async () => {
      const response = await fetch('your-api');
      return response.json();
    }
    ```


### 自定义上传器

1. 函数配置

可以通过 `uploaderModules` 参数动态加载特定的上传器（除 OSS 和 COS 之外）配置文件，以满足不同的上传需求。

该参数为 JSON 格式数组，可以包含多个配置文件路径或函数。

```js
uploaderModules: [ // 自定义上传路径 或者 注入函数
  "./example/uploaderRegistryOSS.js", 
  async () => {
    // 1、extend BaseUploader
    // 2、registerUploader
    // 具体代码参考 uploaderRegistryOSS.js
  }
]
```

2、 自定义文件配置

uploaderRegistryOSS.js

```js
// 代码例子，可按照下面的代码进行修改。（代码就按照这个复制、粘贴，改改）
/*
"scripts": {
  "uploaderRegistryOSS:tice": "cloud-upload-hub --source=src --target=test/sailing  --uploaderModules='[\"./example/uploaderRegistryOSS.js\"]' --ossCopyConfig=./config/oss.tice.conf.json"
},
*/
const OSS = require('ali-oss')
const { BaseUploader, registerUploader } = require('cloud-upload-hub');

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
  async uploadSingleFile(file, target) {
    try {
      const result = await this.client.put(target, file, {
        headers: this.headers, // 选填
      });
      return {
        success: result?.res?.status === 200, // 必填字段
        status: result?.res?.status, // 必填字段
        // message: `文件 ${file} 上传成功到 ${target}`, 默认: `${file} -> ${target}` // 选填
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

## 常见问题

### 1. 如何更改上传目标？

在配置文件中，可以通过 `mode` 参数来指定不同的上传目标：

```json
"scripts": {
    "uploader:tice": "cloud-upload-hub --mode=tice"
}
```

### 2. 如何处理上传成功和失败的事件？

在配置中定义 `onUploadSuccess` 和 `onUploadFail` 回调函数，处理相应的事件：

```javascript
onUploadSuccess(status) {
  console.log('构建成功', status);
},
onUploadFail(status) {
  console.log('构建失败', status);
},
```

### 3. 上传日志什么样子？

```log
====== 共扫描了7个文件，开始上传资源文件。 ======

[OSS][SUCCESS][1/7]: src/.DS_Store -> test/sailing/src/.DS_Store
[OSS][SUCCESS][2/7]: src/upload/cosUpload.js -> test/sailing/src/upload/cosUpload.js
[OSS][SUCCESS][3/7]: src/main.js -> test/sailing/src/main.js
[OSS][SUCCESS][4/7]: src/upload/ossUpload.js -> test/sailing/src/upload/ossUpload.js
[OSS][SUCCESS][5/7]: src/utils/tasks.js -> test/sailing/src/utils/tasks.js
[OSS][SUCCESS][6/7]: src/utils/file.js -> test/sailing/src/utils/file.js

[COS][SUCCESS][1/7]: src/main.js -> test/sailing/src/main.js
[COS][SUCCESS][2/7]: src/.DS_Store -> test/sailing/src/.DS_Store
[COS][SUCCESS][3/7]: src/upload/cosUpload.js -> test/sailing/src/upload/cosUpload.js
[COS][SUCCESS][4/7]: src/utils/tasks.js -> test/sailing/src/utils/tasks.js
[COS][SUCCESS][5/7]: src/utils/file.js -> test/sailing/src/utils/file.js
[COS][SUCCESS][6/7]: src/upload/ossUpload.js -> test/sailing/src/upload/ossUpload.js

====== 开始上传生效文件。 ====== 

[OSS][SUCCESS][7/7]: src/index.html -> test/sailing/src/index.html
[COS][SUCCESS][7/7]: src/index.html -> test/sailing/src/index.html

====== 全部文件上传成功(7个) ======
```
