// Libs
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderTarget
} from 'three';
import { getProject, IProject, ISheet } from '@theatre/core';
// Models
import { assets } from '@ts/models/load';
import gl from '@ts/models/three';
import { Scenes, theatreName } from '@ts/models/types';
// Utils
import debug from '@ts/utils/debug';
import { dispose } from 'tomorrow_web/utils/three';

export default class BaseScene {
  sceneType: Scenes;

  scene: Scene;

  protected camera!: OrthographicCamera | PerspectiveCamera;

  protected clock: Clock;

  protected project: IProject;

  protected animation: ISheet;

  constructor(scene: Scenes) {
    this.sceneType = scene;
    this.scene = new Scene();
    this.clock = new Clock();
    const animation = assets.json['animation'];
    this.project = getProject(theatreName, { state: animation });
    this.animation = this.project.sheet(scene);
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

  draw(renderTarget: WebGLRenderTarget | null) {
    gl.renderer.setRenderTarget(renderTarget);
    gl.renderer.setClearAlpha(0);
    gl.renderer.clear();
    gl.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) { }
}