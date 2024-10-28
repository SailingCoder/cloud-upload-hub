# `drag-kit` - 轻量级前端（代码资源）多云上传库

**multi-cloud-uploader** 是一个轻量级的前端（代码资源）上传库，一个简单的命令行工具，专为多云存储平台的文件上传而设计。它目前支持阿里云 OSS 和腾讯云 COS，未来将扩展到更多云存储服务。通过简洁的 API，开发者可以轻松集成多个云平台的文件上传功能，无需重复实现不同平台的逻辑。支持从本地目录上传文件，并允许在上传完成后特定文件的延迟上传。

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[English Documentation](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/doc/README_EN.md)

### 特性：
- **多云支持**：支持多种云存储平台的文件上传，初始版本支持阿里云 OSS 和腾讯云 COS。
- **易于扩展**：未来将支持更多的云存储服务，如 AWS S3、Google Cloud Storage 等。
- **简化集成**：通过统一的接口，让文件上传变得简单且一致。
- **请求头**：支持配置 OSS 和 COS 的独立请求头。
- **最后上传的文件**：支持指定最后上传的文件（默认 `index.html`）。
- **重试机制**：支持自动重试机制，确保文件上传的可靠性

## 安装

通过 npm 安装此工具到项目中：

```bash
npm install mulcloud-uploader --save-dev 
```

## 使用方法

在命令行中运行以下命令：

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json 
```

或者，在 package.json 配置：

```json
"scripts": {
  "uploader:tice": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/tice  --ossConfig=./oss.tice.conf.json",
  "uploader:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test  --ossConfig=./oss.test.conf.json",
  "uploader:gray": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/gray  --ossConfig=./oss.gray.conf.json",
  "uploader:prod": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/prod  --ossConfig=./oss.prod.conf.json"
}
```

配置`uploadFrom`上传来源、`uploadTo`上传目标文件夹以及`ossConfig`永久密钥等，运行上传命令：

```bash
npm run uploader:tice
```

输出日志：

```json
====== 共扫描了7个文件，开始上传资源文件。 ======

[OSS][SUCCESS][1/7]: src/utils/tasks.js -> test/sailing/src/utils/tasks.js
[OSS][SUCCESS][2/7]: src/main.js -> test/sailing/src/main.js
[OSS][SUCCESS][3/7]: src/upload/cosUpload.js -> test/sailing/src/upload/cosUpload.js
[OSS][SUCCESS][4/7]: src/utils/file.js -> test/sailing/src/utils/file.js
[OSS][SUCCESS][5/7]: src/.DS_Store -> test/sailing/src/.DS_Store
[OSS][SUCCESS][6/7]: src/upload/ossUpload.js -> test/sailing/src/upload/ossUpload.js

====== 开始上传生效文件。 ====== 

[OSS][SUCCESS][7/7]: src/index.html -> test/sailing/src/index.html

====== 全部文件上传成功(7个) ======
```

### 参数说明

- `--ossConfig`: 阿里云OSS配置文件的路径（JSON格式），该文件应包含 `bucket`、`accessKeyId`、`accessKeySecret` 和 `region`。
- `--cosConfig`: 腾讯云COS配置文件的路径（JSON格式），该文件应包含 `Bucket`、`SecretId`、`SecretKey` 和 `Region`。
- `--uploadFrom`: 指定要上传的本地目录或文件路径。
- `--uploadTo`: 在 OSS 或 COS 上存储文件的目标路径。
- `--lastFile`: 最后上传的文件，通常为入口文件（默认 `index.html`）。
- `--maxRetryCount`: 最大重试次数（默认为5）。
- `--concurrency`: 并发上传的数量限制（默认为10）。
- `--headers`: 自定义请求头信息（JSON格式）。
- `--ossHeaders`: OSS 请求头信息（JSON格式）。
- `--cosHeaders`: COS 请求头信息（JSON格式）。

### 显示帮助信息

```bash
multi-cloud-uploader --help
```

## 配置文件示例

### 运行示例：

```bash
multi-cloud-uploader --uploadFrom=path/to/uploadFrom --uploadTo=path/to/uploadTo --headers='{"x-my-header":"my-value"}' --ossConfig=config/ossConfig.json  --cosConfig=config/cosConfig.json
```

### 阿里云OSS配置（ossConfig.json）

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### 腾讯云COS配置（cosConfig.json）

```json
{
  "Bucket": "your-bucket-name",
  "SecretId": "your-secret-id",
  "SecretKey": "your-secret-key",
  "Region": "ap-beijing"
}
```

## 许可

该项目使用 [MIT 许可证](LICENSE)。