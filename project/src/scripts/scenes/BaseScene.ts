// Libs
import {
  Clock,
  Scene
} from 'three';
// Models
import { Scenes } from '@ts/models/types';
// Utils
import debug from '@ts/utils/debug';
import { dispose } from 'tomorrow_web/utils/three';

export default class BaseScene {
  sceneType: Scenes;

  scene: Scene;

  protected clock: Clock;

  constructor(scene: Scenes) {
    this.sceneType = scene;
    this.scene = new Scene();
    this.clock = new Clock();
  }

  init() {
    this.initScene();
    this.initAnimation();
    if (debug.enabled) this.initDebug();
  }

  protected initScene() {
    //
  }

  protected initAnimation() {
    //
  }

  protected initDebug() {
    //
  }

  dispose() {
    dispose(this.scene);
  }

  show() {
    this.clock.start();
  }

  hide() {
    //
  }

  update() { }
  draw() { }
  resize(width: number, height: number) { }
}