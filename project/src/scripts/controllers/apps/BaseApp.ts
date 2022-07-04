// Lib
import raf from 'tomorrow_web/utils/raf';
import studio from '@theatre/studio';
import debug from '@ts/utils/debug';
// Models
import gl from '@ts/models/three';
// Controllers
import smoothing from 'tomorrow_web/animation/Smooth';

export default class BaseApp {
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
  }

  dispose() {
    raf.pause();
    window.removeEventListener('resize', this.resize);
  }

  update() { }

  draw() {
    gl.renderer.info.reset();
  }

  resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    gl.resize(width, height);
  }
}