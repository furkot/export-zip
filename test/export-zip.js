import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import exportZip from '../lib/export-zip.js';

// reference text.zip is generated with 'store only' and 'no extras' options
// zip -X -0 test.zip a.txt b.bin

test('zip files', async t => {
  const files = ['a.txt', 'b.bin', 'test.zip']
    .map(name => resolve(import.meta.dirname, 'fixtures', name))
    .map(name => readFile(name));
  const [a, b, zip] = await Promise.all(files);

  const date = new Date(Date.UTC(2022, 4, 30, 14, 2));

  const data = exportZip([
    { name: 'a.txt', bytes: a, date },
    { name: 'b.bin', bytes: b, date }
  ]);

  const result = Buffer.concat(Array.from(data).map(b => new Uint8Array(b)));

  t.assert.deepEqual(result, zip);
});
