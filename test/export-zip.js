const { readFile } = require('node:fs').promises;
const { resolve } = require('node:path');

const test = require('tape');
const exportZip = require('../');

// reference text.zip is generated with 'store only' and 'no extras' options
// zip -X -0 test.zip a.txt b.bin

test('zip files', async function (t) {
  const files = ['a.txt', 'b.bin', 'test.zip']
    .map(name => resolve(__dirname, 'fixtures', name))
    .map(name => readFile(name));
  const [a, b, zip] = await Promise.all(files);

  const date = new Date(Date.UTC(2022, 4, 30, 14, 2));

  const data = exportZip([
    { name: 'a.txt', bytes: a, date },
    { name: 'b.bin', bytes: b, date }
  ]);

  const result = Buffer.concat(Array.from(data).map(b => new Uint8Array(b)));

  t.deepEqual(result, zip);
});
