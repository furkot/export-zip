module.exports = crc;

const crcTable = Uint32Array.from(create());

function* create() {
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    yield c;
  }
}

function crc(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  const result = new Uint8Array(4);
  const dv = new DataView(result.buffer);
  dv.setUint32(0, crc ^ 0xffffffff, true);
  return result;
}
