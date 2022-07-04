/**
 * Promise-based loader
 */
import { CubeTexture, Texture } from 'three';
import {
  fileName
} from 'tomorrow_web/utils/dom';
import {
  loadCubeTexture,
  loadFBX,
  loadOBJ,
  loadTexture
} from './three';
import { assets, copyAssets } from '@ts/models/load';
import GLTFPlayer from '@ts/animation/GLTFPlayer';

export class Loader {
  supportsBlob = false;

  constructor() {
    try {
      this.supportsBlob = !!new Blob();
    } catch (e) {
      this.supportsBlob = false;
    }
  }

  /**
	 * Loads items through a XMLHttpRequest
	 * @param path The URL of the file
	 * @param responseType The type of the request
	 * @param onProgress A callback function with the loaded progress
	 */
  async loadXHR(
    path: string,
    responseType: XMLHttpRequestResponseType,
    onProgress: (progress: number) => void
  ): Promise < XMLHttpRequest > {
    return new Promise < XMLHttpRequest >((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = responseType;
      request.addEventListener('progress', (event: ProgressEvent) => {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }, false);
      request.addEventListener('load', () => {
        resolve(request);
      }, false);
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.send();
    });
  }

  async loadImage(
    path: string,
    onProgress: (progress: number) => void
  ): Promise < HTMLImageElement > {
    if (this.supportsBlob) {
      return this.loadImageBlob(path, onProgress);
    }
    return this.loadImageElement(path);
  }

  /**
	 * Loads an XHR Image
	 * @param path The URL of the image
	 * @param onProgress A callback function with the loaded progress
	 */
  private async loadImageBlob(
    path: string,
    onProgress: (progress: number) => void
  ): Promise < HTMLImageElement > {
    return new Promise < HTMLImageElement >((resolve, reject) => {
      this.loadXHR(path, 'blob', onProgress)
        .then((request: XMLHttpRequest) => {
          const image = new Image();
          window.URL.revokeObjectURL(request.response);
          image.src = window.URL.createObjectURL(request.response);

          resolve(image);
        })
        .catch(reject);
    });
  }

  /**
	 * Loads an HTML Image Element
	 * @param path The URL of the image
	 * @returns A Promise with the image as a param
	 */
  private async loadImageElement(
    path: string
  ): Promise < HTMLImageElement > {
    return new Promise < HTMLImageElement >((resolve, reject) => {
      const request = new Image();
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('load', () => {
        resolve(request);
      }, false);
      request.src = path;
    });
  }

  /**
	 * Loads a set of images
	 * @param baseURL If the images share a common URL, set the base to shed redundancy
	 * @param images An array of images to load
	 * @param onProgress A callback function with the loaded progress
	 */
  async loadImages(
    baseURL: string,
    images: Array < string >,
    onProgress: (progress: number) => void
  ): Promise < HTMLImageElement[] > {
    // All the Promises
    const promises: Promise < HTMLImageElement > [] = [];
    if (this.supportsBlob) {
      // On Progress Update
      const progression = {};
      const onProgressUpdate = () => {
        let total = 0;
        let count = 0;
        Object.keys(progression).forEach((i) => {
          count++;
          total += progression[i];
        });

        const progress = total / count;
        onProgress(progress);
      };
      images.forEach((image: string) => {
        progression[image] = 0;
        promises.push(this.loadImageBlob(baseURL + image, (progress: number) => {
          progression[image] = progress;
          onProgressUpdate();
        }));
      });
    } else {
      let loaded = 0;
      const total = images.length;
      images.forEach((image: string) => {
        promises.push(new Promise((resolve, reject) => {
          this.loadImageElement(baseURL + image)
            .then((imageElement: HTMLImageElement) => {
              ++loaded;
              const progress = loaded / total;
              onProgress(progress);
              resolve(imageElement);
            }).catch(reject);
        }));
      });
    }

    return Promise.all(promises);
  }

  /**
	 * Loads a JSON file
	 * @param path The URL of the JSON
	 * @param onProgress A callback function with the loaded progress
	 */
  async loadJSON(
    path: string,
    onProgress: (progress: number) => void
  ): Promise < any > {
    return new Promise < any >((resolve, reject) => {
      this.loadXHR(path, 'json', onProgress)
        .then((request: XMLHttpRequest) => {
          let json = request.response;
          if (typeof json === 'string') {
            json = JSON.parse(json);
          }
          resolve(json);
        })
        .catch(reject);
    });
  }

  /**
	 * Loads an HTML Audio Element
	 * @param path The URL of the audio
	 * @returns A Promise with the audio as a param
	 */
  async loadAudioElement(
    path: string
  ): Promise < HTMLAudioElement > {
    return new Promise < HTMLAudioElement >((resolve, reject) => {
      const request = document.createElement('audio') as HTMLAudioElement;
      request.setAttribute('crossOrigin', 'anonymous');
      request.autoplay = false;
      request.src = path;
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('canplaythrough', () => {
        resolve(request);
      }, false);
      request.load();
    });
  }

  /**
	 * Loads an HTML Video Element
	 * @param path The URL of the video
	 * @returns A Promise with the video as a param
	 */
  async loadVideoElement(
    path: string
  ): Promise < HTMLVideoElement > {
    return new Promise < HTMLVideoElement >((resolve, reject) => {
      const request = document.createElement('video') as HTMLVideoElement;
      request.setAttribute('crossOrigin', 'anonymous');
      request.playsInline = true;
      request.autoplay = false;
      request.src = path;
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('canplaythrough', () => {
        resolve(request);
      }, false);
      request.load();
    });
  }

  /**
	 * Used to load an entire chunk of assets (an entire page, section, etc.)
	 * @param items An Array of items to load
	 * @param onProgress A callback function with the loaded progress
	 * @returns An object of the loaded files { audio, custom, images, json, videos }
	 */
  async loadAssets(
    items: Array < any >,
    onProgress: (progress: number) => void
  ): Promise < any > {
    return new Promise < any >((resolve, reject) => {
      let loaded = 0;
      const total = items.length;
      const files = Object.assign({}, assets);

      if (total < 1) {
        onProgress(1);
        resolve(files);
        return;
      }

      let timer: any = setInterval(() => {
        const progress = loaded / (total - 1);
        onProgress(Number.isNaN(progress) ? 0 : progress);
      }, 1000 / 30);

      const killTimer = () => {
        clearInterval(timer);
        timer = undefined;
      };

      const onLoad = () => {
        ++loaded;
        if (loaded >= total) {
          onProgress(1);
          killTimer();
          copyAssets(files);
          resolve(files);
        }
      };

      items.forEach((item: any) => {
        const {
          type,
          file
        } = item;
        const fileID = item.fileID !== undefined ? item.fileID : fileName(file);
        switch (type) {
          case 'audio':
            this.loadAudioElement(file).then((audio: HTMLAudioElement) => {
              files.audio[fileID] = audio;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
							reject(`Error loading: ${file}`);
            });
            break;
          case 'custom':
            item.load(file).then((asset: any) => {
              files.custom[fileID] = asset;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
							reject(`Error loading: ${file}`);
            });
            break;
          default:
          case 'image':
            this.loadImageElement(file).then((image: HTMLImageElement) => {
              files.images[fileID] = image;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
							reject(`Error loading: ${file}`);
            });
            break;
          case 'json':
            this.loadJSON(file, () => {}).then((json: any) => {
              files.json[fileID] = json;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
							reject(`Error loading: ${file}`);
            });
            break;
          case 'video':
            this.loadVideoElement(file).then((image: HTMLVideoElement) => {
              files.videos[fileID] = image;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'cubeTexture':
            loadCubeTexture(file).then((asset: CubeTexture) => {
              files.cubeTextures[fileID] = asset;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'texture':
            loadTexture(file).then((asset: Texture) => {
              files.textures[fileID] = asset;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'gltf':
            GLTFPlayer.loadGLTF(file, () => { }).then((model: any) => {
              files.models[fileID] = model;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'fbx':
            loadFBX(file).then((model: any) => {
              files.models[fileID] = model;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'obj':
            loadOBJ(file).then((model: any) => {
              files.models[fileID] = model;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
        }
      });
    });
  }
}

const loader = new Loader();
export default loader;