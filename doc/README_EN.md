# multi-cloud-uploader Documentation

**multi-cloud-uploader** is a lightweight file upload library designed for front-end resource uploads to multiple cloud storage platforms. This simple command-line tool is tailored for uploading files to multi-cloud environments and currently supports Alibaba Cloud OSS and Tencent Cloud COS. Future updates will expand support to other cloud providers. By using a streamlined API, developers can easily integrate file upload capabilities across multiple cloud platforms without needing to implement custom logic for each one. The tool supports uploading from local directories and allows delayed uploads for specified files upon completion.

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[中文文档](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/README.md)

## Features
- **Multi-Cloud Support**: Initial support for Alibaba Cloud OSS and Tencent Cloud COS with planned expansion to other services.
- **Easy Extensibility**: Future updates will support AWS S3, Google Cloud Storage, and more.
- **Simplified Integration**: A unified interface streamlines file uploads across platforms.
- **Customizable Headers**: Configure request headers for OSS and COS independently.
- **Final File Upload Option**: Allows specifying the last file to upload (default is `index.html`).
- **Retry Mechanism**: Automatic retry ensures reliable file upload.

## Installation

Install the tool via npm in your project:

```bash
npm install multi-cloud-uploader --save-dev
```

## Usage

To use the tool from the command line, run:

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json
```

Or configure it within `package.json`:

```json
"scripts": {
  "uploader:tice": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/tice --ossConfig=./oss.tice.conf.json",
  "uploader:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json",
  "uploader:gray": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/gray --ossConfig=./oss.gray.conf.json",
  "uploader:prod": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/prod --ossConfig=./oss.prod.conf.json"
}
```

Set the `uploadFrom` source, `uploadTo` target directory, and `ossConfig` or `cosConfig` with credentials. Run the upload script:

```bash
npm run uploader:tice
```

Example output:

```json
====== Scanned 7 files. Starting upload. ======

[OSS][SUCCESS][1/7]: src/utils/tasks.js -> test/sailing/src/utils/tasks.js
[OSS][SUCCESS][2/7]: src/main.js -> test/sailing/src/main.js
[OSS][SUCCESS][3/7]: src/upload/cosUpload.js -> test/sailing/src/upload/cosUpload.js
[OSS][SUCCESS][4/7]: src/utils/file.js -> test/sailing/src/utils/file.js
[OSS][SUCCESS][5/7]: src/.DS_Store -> test/sailing/src/.DS_Store
[OSS][SUCCESS][6/7]: src/upload/ossUpload.js -> test/sailing/src/upload/ossUpload.js

====== Uploading final file. ====== 

[OSS][SUCCESS][7/7]: src/index.html -> test/sailing/src/index.html

====== Upload complete (7 files). ======
```

## Parameters

- `--ossConfig`: Path to the OSS configuration file in JSON format, containing `bucket`, `accessKeyId`, `accessKeySecret`, and `region`.
- `--cosConfig`: Path to the COS configuration file in JSON format, containing `Bucket`, `SecretId`, `SecretKey`, and `Region`.
- `--uploadFrom`: Local directory or file path for upload.
- `--uploadTo`: Target path on OSS or COS for storing files.
- `--lastFile`: Specifies the last file to upload, typically an entry file (default `index.html`).
- `--maxRetryCount`: Maximum retry attempts (default is 5).
- `--concurrency`: Limits concurrent uploads (default is 10).
- `--headers`: Custom request headers (JSON format).
- `--ossHeaders`: Custom OSS-specific headers (JSON format).
- `--cosHeaders`: Custom COS-specific headers (JSON format).

## Help

To display help information:

```bash
multi-cloud-uploader --help
```

## Example Configuration Files

### Usage Example:

```bash
multi-cloud-uploader --uploadFrom=path/to/uploadFrom --uploadTo=path/to/uploadTo --headers='{"x-my-header":"my-value"}' --ossConfig=config/ossConfig.json --cosConfig=config/cosConfig.json
```

### Alibaba Cloud OSS Configuration (ossConfig.json)

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### Tencent Cloud COS Configuration (cosConfig.json)

```json
{
  "Bucket": "your-bucket-name",
  "SecretId": "your-secret-id",
  "SecretKey": "your-secret-key",
  "Region": "ap-beijing"
}
```

## License

This project is licensed under the [MIT License](LICENSE).