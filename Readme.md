[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @furkot/export-zip

Composite exporter that solves problem of downloading/exporting multiple files.

## Install

```sh
$ npm install --save @furkot/export-zip
```

## Usage

```js
const exportZip = require('@furkot/export-zip');

const buffers = exportZip([
  { name: 'day-1', bytes: day1 },
  { name: 'day-2', bytes: day2 }
]);

// buffers is now a generator/iterator producing store-only zip file
const zip = new Blob(Array.from(buffers));

```

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/@furkot/export-zip.svg
[npm-url]: https://npmjs.org/package/@furkot/export-zip

[build-url]: https://github.com/furkot/export-zip/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/furkot/export-zip/check

[deps-image]: https://img.shields.io/librariesio/release/npm/@furkot/export-zip
[deps-url]: https://libraries.io/npm/@furkot%2Fexport-zip
