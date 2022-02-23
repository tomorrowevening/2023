// Models
import dispatcher from '@ts/models/dispatcher';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Scenes
import BaseScene from '@ts/scenes/BaseScene';
import CompositeScene from '@ts/scenes/composite';
import UIScene from '@ts/scenes/ui';
import WelcomeScene from '@ts/scenes/welcome';
import IntroScene from '@ts/scenes/intro';

class SceneController {
  currentScene?: BaseScene;

  compositeScene: CompositeScene;

  uiScene: UIScene;

  private nextScene?: BaseScene;

  constructor() {
    this.compositeScene = new CompositeScene();
    this.uiScene = new UIScene();
  }

  enable() {
    this.uiScene.init();
    dispatcher.addEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.addEventListener(Events.SCENE_HIDDEN, this.sceneHidden);
  }

  dispose() {
    this.currentScene?.dispose();
    this.nextScene?.dispose();
    dispatcher.removeEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.removeEventListener(Events.SCENE_HIDDEN, this.sceneHidden);
  }

  update() {
    this.currentScene?.update();
  }

  draw() {
    const mainRT = gl.renderTargets.get('main')!;
    this.currentScene?.draw(mainRT);
    this.uiScene.draw();
    this.compositeScene.draw();
  }

  resize(width: number, height: number) {
    this.currentScene?.resize(width, height);
    this.uiScene.resize(width, height);
    this.compositeScene.resize(width, height);
  }

  private showScene = (event: any) => {
    switch (event.scene) {
      case Scenes.WELCOME:
        this.nextScene = new WelcomeScene();
        break;
      case Scenes.INTRO:
        this.nextScene = new IntroScene();
        break;
    }

    if (this.currentScene !== undefined) {
      console.log('hide current scene', this.currentScene.sceneType);
      this.currentScene.hide();
    } else {
      this.showNextScene();
    }
  }

  private sceneHidden = (event: any) => {
    this.currentScene?.dispose();
    this.showNextScene();
  }

  private showNextScene() {
    console.log('showNextScene::', this.nextScene?.sceneType);
    this.currentScene = this.nextScene;
    this.nextScene = undefined;
    this.currentScene?.init();
    this.currentScene?.resize(window.innerWidth, window.innerHeight);
    this.currentScene?.show();
  }
}

const scenes = new SceneController();
export default scenes;