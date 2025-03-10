<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Run tests

```bash
# run tests
$ npm run test
```

## File Upload Endpoint Documentation

The file upload endpoint allows users to upload multiple CSV files (up to 10 files at a time) with a maximum file size of 250MB per file. The files are processed concurrently, and their paths are returned upon successful upload.

### Request Example

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Content-Type: multipart/form-data" \
  -H "x-request-id: request-id" \
  -F "files=@file1.csv" \
  -F "files=@file2.csv"
```

### Success Response (HTTP 200)

```json
{
  "message": "Files uploaded and processed successfully",
  "filenames": ["file1.csv", "file2.csv"],
  "paths": [
    "/path/to/uploads/uuid-file1.csv",
    "/path/to/uploads/uuid-file2.csv"
  ]
}
```

### Error Response (HTTP 400)

```json
{
  "statusCode": 400,
  "message": "No files uploaded."
}
```

### Error Response (HTTP 429)

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

### Expected Behavior Under Load

1. Concurrency:
- The endpoint processes up to 5 files concurrently using p-limit.
- If more than 5 files are uploaded, the additional files are queued and processed sequentially.
2. Rate Limiting:
- The endpoint is protected by a dynamic rate limiter:
    - Default rate limit: 6 requests per minute.
    - If the system is under stress (CPU or memory usage is high), the rate limit is reduced to 2 requests per minute.
3. File Size and Count:
- Maximum file size: 250MB.
- Maximum number of files per request: 10.
4. Retry Mechanism:
- If file saving fails, the system retries the operation up to 5 times with exponential backoff.
5. Logging:
- All file uploads and errors are logged for monitoring and debugging purposes.

### Common Errors

#### No Files Uploaded (HTTP 400):

```json
{
  "statusCode": 400,
  "message": "No files uploaded."
}
```

#### Invalid File Type (HTTP 400):

```json
{
  "statusCode": 400,
  "message": "Only CSV files are allowed!"
}
```

#### File Too Large (HTTP 400):

```json
{
  "statusCode": 400,
  "message": "File size exceeds the limit of 250MB."
}
```

#### Too Many Requests (HTTP 429):

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

#### Internal Server Error (HTTP 500):

```json
{
  "statusCode": 500,
  "message": "Failed to save file: <error details>"
}
```