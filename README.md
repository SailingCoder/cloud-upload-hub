# multi-cloud-uploader - 轻量级前端多云上传库

**multi-cloud-uploader** 是一个轻量级的前端资源 Node 上传库，专为多云存储平台的文件上传而设计。它目前支持阿里云 OSS 和腾讯云 COS，也支持动态扩展其他云存储上传能力，未来将扩展到更多云存储服务。这个库的目的是通过简洁的 API，开发者可以轻松集成多个云平台的文件上传功能，无需重复实现不同平台的逻辑。

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[English Documentation](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/doc/README_EN.md)

### 特性

*   **多种云存储支持**：支持 OSS、COS 等，用户可动态选择单个或多个上传。
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
*   `--ossHeaders`: OSS 请求头（JSON格式）。
*   `--cosHeaders`: COS 请求头（JSON格式）。

### 配置文件路径 

以阿里云OSS配置（ossConfig.json）为例：（例子具体见[example](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example/config)）

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

