# multi-cloud-uploader - Lightweight Frontend Multi-Cloud Upload Library

**multi-cloud-uploader** is a lightweight Node library designed for uploading files to multiple cloud storage platforms. Currently, it supports Alibaba Cloud OSS and Tencent Cloud COS, with plans to extend support to more cloud storage services in the future. This library aims to simplify the integration of file upload functionality across different cloud platforms, allowing developers to avoid redundant implementations for each service.

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[Chinese Documentation](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/doc/README_CN.md)

### Features

*   **Multi-Cloud Support**: Supports OSS, COS, and allows users to dynamically choose single or multiple uploads.
*   **Easy to Extend**: Future support for more cloud storage options like AWS S3 and Google Cloud Storage.
*   **Simplified Integration**: Unified API to streamline the file upload process.
*   **Custom Headers**: Supports independent request header configuration for OSS and COS.
*   **Last File Upload Specification**: Default support for `index.html`.
*   **Retry Mechanism**: Automatic retries for uploads to ensure reliability.

## Installation

Install the library via npm:

```bash
npm install multi-cloud-uploader --save-dev 
```

## Usage

### Command-Line Example

To use multi-cloud-uploader, run the following command in the terminal:

```bash
multi-cloud-uploader --uploadFrom=<source directory> --uploadTo=<destination directory> --ossConfig=<oss configuration file>
```

### Example

To upload files to a test directory:

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json 
```

In your package.json, you can configure scripts as follows:

```json
"scripts": {
  "uploader:tice": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/tice --ossConfig=./config/oss.tice.conf.json",
  "uploader:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./config/oss.test.conf.json",
  "uploader:gray": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/gray --ossConfig=./config/oss.gray.conf.json",
  "uploader:prod": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/prod --ossConfig=./config/oss.prod.conf.json"
}
```

Execute a command with:

```bash
npm run uploader:tice
```

### Parameter Explanation

*   `--ossConfig`: Path to the Alibaba Cloud OSS configuration file (in JSON format), must include `bucket`, `accessKeyId`, `accessKeySecret`, and `region`.
*   `--cosConfig`: Path to the Tencent Cloud COS configuration file (in JSON format), must include `Bucket`, `SecretId`, `SecretKey`, and `Region`.
*   `--uploadFrom`: Specify the local directory or file path to upload.
*   `--uploadTo`: Target path in OSS or COS.
*   `--lastFile`: The last file to upload (default is `index.html`).
*   `--maxRetryCount`: Maximum number of retry attempts (default is 5).
*   `--concurrency`: Limit on the number of concurrent uploads (default is 10).
*   `--headers`: Custom request headers (in JSON format).
*   `--ossHeaders`: OSS request headers (in JSON format).
*   `--cosHeaders`: COS request headers (in JSON format).

### Configuration File Example

For an Alibaba Cloud OSS configuration (ossConfig.json):

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### Show Help Information

To display help information, run:

```bash
multi-cloud-uploader --help
```