import { SpriteFrame } from "cc";

const INDEX_REG = /\((\d+)\)/;

const getNumberWithinString = (str: string) => parseInt(str.match(INDEX_REG)?.[1] || "0");

export const sortSpriteFrame = (spriteFrame: Array<SpriteFrame>) =>
  spriteFrame.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name));

export const rad2Angle = (rad: number) => rad * 180 / Math.PI;


export const deepClone = (obj: any) => {

  if (obj == null || typeof obj != 'object') {

    return obj;
  }
  const res = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      res[key] = deepClone(obj[key]);
    }

  }
  return res;
}

export const seedRandom = (seed: number) => {
  return seed = (seed * 9301 + 49297) % 233280;
}