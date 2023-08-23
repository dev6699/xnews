# xnews

<p align="center">
    <picture >
      <img alt="RNTV Logo" src="./assets/adaptive-icon.png" width="200">
    </picture>    
</p>

## What is xnews?

Ads free Text-to-Speech (TTS) news.

Check out the live demo of the project [here](https://xnews.pages.dev/).

## Table of Contents

- [What is xnews?](#what-is-xnews)
- [Table of Contents](#table-of-contents)
- [Screeshots](#screeshots)
- [Installation](#installation)
- [Development](#development)
- [Release build](#release-build)
- [License](#license)

## Screeshots

<img src="./docs/list.png" width="45%" height="100%">
<img src="./docs/news.png" width="45%" height="100%">

## Installation

Make sure you have setup react native environment [here](https://reactnative.dev/docs/environment-setup)

Clone this repo

```bash
git clone https://github.com/dev6699/xnews.git
cd xnews
```

Install dependencies

```bash
npm i
```

## Development

1. For android
   ```
   npm run android
   ```
2. For web [Cloudflare Pages](https://pages.cloudflare.com)
   ```
   npm run web
   npm run pages:dev
   ```
   Open your web browser and go to http://localhost:3000 to access the application.

## Release build

1. For android

   ```
   npm run build
   ```

2. For web
   ```
   npm run pages:deploy
   ```

## License

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/dev6699/rntv/blob/main/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).
