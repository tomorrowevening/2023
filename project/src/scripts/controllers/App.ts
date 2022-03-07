// Lib
import raf from 'tomorrow_web/utils/raf';
import studio from '@theatre/studio';
import debug from '@ts/utils/debug';
// Models
import dispatcher from '@ts/models/dispatcher';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Controllers
import scenes from '@ts/controllers/SceneController';
import smoothing from 'tomorrow_web/animation/Smooth';

export default class App {
  constructor() {
    if (debug.enabled) studio.initialize();
  }

  init() {
    gl.renderer.info.autoReset = false;
    raf.add('app', () => {
      debug.begin();
      smoothing.update();
      this.update();
      this.draw();
      debug.end();
    });
    raf.play();
    this.resize();
    window.addEventListener('resize', this.resize, false);
    scenes.enable();
    dispatcher.dispatchEvent({
      type: Events.SHOW_SCENE,
      scene: Scenes.WELCOME
    });
  }

  dispose() {
    scenes.dispose();
    raf.pause();
    window.removeEventListener('resize', this.resize);
  }

  update() {
    scenes.update();
  }

  draw() {
    gl.renderer.info.reset();
    scenes.draw();
  }

  resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    gl.resize(width, height);
    scenes.resize(width, height);
  };
}