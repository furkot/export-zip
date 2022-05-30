const test = require('tape');
const exportZip = require('../');

test('export-zip must have at least one test', function (t) {
  exportZip();
  t.fail('Need to write tests.');
  t.end();
});
