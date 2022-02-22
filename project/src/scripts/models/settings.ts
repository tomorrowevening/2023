import { getGPUTier } from 'detect-gpu';
import { isMobile, isSafari } from 'tomorrow_web/utils/dom';

export enum Quality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
};

const settings = {
  anisotropy: 1,
  mobile: isMobile,
  fps: 60,
  quality: Quality.LOW,
  tier: 0
};

export default settings;

export function updateSettings(): Promise <void> {
  return new Promise<void>((resolve) => {
    (async () => {
      // GPU settings
      const gpuTier = await getGPUTier();
      settings.tier = gpuTier.tier;

      if (gpuTier.fps) settings.fps = gpuTier.fps;

      // Safari sucks
      if (isSafari) settings.tier = 1;

      // Quality override
      const hashQuality = document.location.hash.search('quality');
      if (hashQuality > -1) {
        // http://localhost:3000/#quality=high
        const qualityHash = document.location.hash.slice(hashQuality + 8).split(',')[0];
        if (qualityHash === Quality.LOW) {
          settings.tier = 1;
        } else if (qualityHash === Quality.MEDIUM) {
          settings.tier = 2;
        } else if (qualityHash === Quality.HIGH) {
          settings.tier = 3;
        }
      }

      switch (settings.tier) {
        case 3:
          settings.quality = Quality.HIGH;
          break;
        case 2:
          settings.quality = Quality.MEDIUM;
          break;
        default:
        case 1:
        case 0:
          settings.quality = Quality.LOW;
          break;
      }

      // M1 reset
      if (gpuTier.gpu && gpuTier.gpu.search('apple m1') > -1) {
        settings.quality = Quality.HIGH;
        settings.fps = 60;
        settings.tier = 3;
      }

      resolve();
    })();
  });
}