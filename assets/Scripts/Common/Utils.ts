export const toFixed = (num: number, digit = 3) => {

    const scale = 10 ** digit;
    return Math.floor(num * scale) / scale;

}


export const strencode = (str: string) => {
    let byteArray: number[] = [];
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (charCode <= 0x7f) {
        byteArray.push(charCode);
      } else if (charCode <= 0x7ff) {
        byteArray.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
      } else if (charCode <= 0xffff) {
        byteArray.push(0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
      } else {
        byteArray.push(
          0xf0 | (charCode >> 18),
          0x80 | ((charCode & 0x3f000) >> 12),
          0x80 | ((charCode & 0xfc0) >> 6),
          0x80 | (charCode & 0x3f)
        );
      }
    }
    return new Uint8Array(byteArray);
  };
  
  export const strdecode = (bytes: Uint8Array) => {
    let array: number[] = [];
    let offset = 0;
    let charCode = 0;
    let end = bytes.length;
    while (offset < end) {
      if (bytes[offset] < 128) {
        charCode = bytes[offset];
        offset += 1;
      } else if (bytes[offset] < 224) {
        charCode = ((bytes[offset] & 0x1f) << 6) + (bytes[offset + 1] & 0x3f);
        offset += 2;
      } else if (bytes[offset] < 240) {
        charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
        offset += 3;
      } else {
        charCode =
          ((bytes[offset] & 0x07) << 18) +
          ((bytes[offset + 1] & 0x3f) << 12) +
          ((bytes[offset + 2] & 0x3f) << 6) +
          (bytes[offset + 3] & 0x3f);
        offset += 4;
      }
      array.push(charCode);
    }
    return String.fromCharCode.apply(null, array);
  };