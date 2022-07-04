export const assets = {
  audio: {},
  cubeTextures: {},
  custom: {},
  images: {},
  json: {},
  models: {},
  textures: {},
  videos: {}
};

const assetTypes: Array<string> = [];
for (let i in assets) {
  assetTypes.push(i);
}

export function copyAssets(loaded: any) {
  assetTypes.forEach((value: string) => {
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
  },
  {
    type: 'json',
    file: 'json/animation.json'
  },
  {
    type: 'json',
    file: 'json/VarelaRound-Regular.json'
  },
  {
    type: 'texture',
    file: 'images/fonts/VarelaRound-Regular.png'
  },
  {
    type: 'texture',
    file: 'images/ui/te_logo.png'
  },
  {
    type: 'texture',
    file: 'images/ui/loadBar.png'
  },
  {
    type: 'fbx',
    file: 'models/idle.fbx'
  },
];

export const files = [];