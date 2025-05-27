const calculateCRC = require('./crc');

module.exports = zip;
zip.contentType = 'application/zip';
zip.extension = 'zip';

/* global TextEncoder */

const te = new TextEncoder();

// see: https://en.wikipedia.org/wiki/ZIP_(file_format)#Structure

const LOCAL_FILE_HEADER_LEN = 30;
const CE_FILE_HEADER_LEN = 46;

function* zip(files) {
  let offset = 0;
  const dirs = [];
  let mod = timestamp();
  for (const { name, bytes, date } of files) {
    const fname = withLen(te.encode(name));
    const crc = calculateCRC(bytes);
    if (date) {
      mod = timestamp(date);
    }
    const dir = { offset, fname, len: uint32(bytes.length), crc, mod };
    dirs.push(dir);
    yield localFileHeader(dir);
    yield fname.bytes;
    offset += LOCAL_FILE_HEADER_LEN + fname.bytes.length;
    yield bytes;
    offset += bytes.length;
  }
  let size = 0;
  for (const dir of dirs) {
    const { fname } = dir;
    yield centralDirectoryFileHeader(dir);
    yield fname.bytes;
    size += CE_FILE_HEADER_LEN + fname.bytes.length;
  }
  yield endOfCentralDirectory({ offset, size, count: uint16(dirs.length) });
}

function localFileHeader({ fname, len, crc, mod }) {
  return Uint8Array.from([
    0x50,
    0x4b,
    0x03,
    0x04, // FH signature
    0x0a,
    0x00, // min version
    0x00,
    0x00, // flag
    0x00,
    0x00, // store compression
    ...mod, // mod time and date
    ...crc,
    ...len, // compressed size
    ...len, // uncompressed size (same since store only)
    ...fname.len,
    0x00,
    0x00 // extra length
  ]);
}

function centralDirectoryFileHeader({ offset, fname, len, crc, mod }) {
  return Uint8Array.from([
    0x50,
    0x4b,
    0x01,
    0x02, // CE signature
    0x1e,
    0x03, // version
    0x0a,
    0x00, // min version
    0x00,
    0x00, // flag
    0x00,
    0x00, // store compression
    ...mod, // mod time and date
    ...crc,
    ...len, // compressed size
    ...len, // uncompressed size (same since store only)
    ...fname.len,
    0x00,
    0x00, // extra length
    0x00,
    0x00, // file comment length
    0x00,
    0x00, // start disk
    0x00,
    0x00, // attrs internal
    0x00,
    0x00,
    0xb4,
    0x81, // attrs external - coresponds to 0100664
    ...uint32(offset)
  ]);
}

function endOfCentralDirectory({ offset, count, size }) {
  return Uint8Array.from([
    0x50,
    0x4b,
    0x05,
    0x06, // EOCD signature
    0x00,
    0x00, // disk
    0x00,
    0x00, // start disk
    ...count, // CE records on this disk
    ...count, // total CE records
    ...uint32(size), // size of central directory
    ...uint32(offset), // start of central directory
    0x00,
    0x00 // comments length
  ]);
}

function withLen(bytes) {
  return {
    bytes,
    len: uint16(bytes.length)
  };
}

function uint32(v) {
  const result = new Uint8Array(4);
  const dv = new DataView(result.buffer);
  dv.setUint32(0, v, true);
  return result;
}

function uint16(v) {
  const result = new Uint8Array(2);
  const dv = new DataView(result.buffer);
  dv.setUint16(0, v, true);
  return result;
}

function timestamp(date = new Date()) {
  let t = date.getUTCHours() << 6;
  t |= date.getUTCMinutes();
  t <<= 5;
  t |= date.getUTCSeconds() / 2;

  let d = date.getUTCFullYear() - 1980;
  d <<= 4;
  d |= date.getUTCMonth() + 1;
  d <<= 5;
  d |= date.getUTCDate();

  const result = new Uint8Array(4);
  const dv = new DataView(result.buffer);
  dv.setUint16(0, t, true);
  dv.setUint16(2, d, true);
  return result;
}
