// Lib
import loader from '@ts/utils/loader';
// Models
import dispatcher from '@ts/models/dispatcher';
import { requiredFiles } from '@ts/models/load';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Controllers
import BaseApp from './BaseApp'
import scenes from '@ts/controllers/SceneController';
import debug from '@ts/utils/debug';

export default class WebsiteApp extends BaseApp {
  constructor() {
    super()
    if (debug.enabled) scenes.initDebug()
    const loadingSection = document.getElementById('loading')!;
    const loadingText = loadingSection.querySelector('p')!;
    loadingSection.classList.remove('hidden');
    loader.loadAssets(requiredFiles, (progress: number) => {
      const loaded = Math.round(progress * 100);
      loadingText.innerHTML = `LOADING: ${loaded}%`;
    }).then(() => {
      // HTML
      loadingSection.classList.add('hidden');
      const welcomeSection = document.getElementById('welcome')!;
      welcomeSection.classList.remove('hidden');

      this.init();
    });
  }

  override init() {
    super.init()
    scenes.enable();
    dispatcher.dispatchEvent({
      type: Events.SHOW_SCENE,
      scene: Scenes.WELCOME
    });
  }

  override dispose() {
    scenes.dispose();
    super.dispose()
  }

  override update() {
    scenes.update();
  }

  override draw() {
    super.draw()
    scenes.draw();
  }

  resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    gl.resize(width, height);
    scenes.resize(width, height);
  };
}