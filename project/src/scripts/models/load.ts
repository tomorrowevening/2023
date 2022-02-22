export const assets = {
  audio: {},
  custom: {},
  images: {},
  json: {},
  videos: {}
};

export function copyAssets(loaded: any) {
  const type = ['audio', 'custom', 'images', 'json', 'videos'];
  type.forEach((value: string) => {
    assets[value] = {
      ...assets[value],
      ...loaded[value]
    };
  });
}

export const requiredFiles = [
  {
    type: 'json',
    file: 'json/config.json'
  }
];

export const files = [];