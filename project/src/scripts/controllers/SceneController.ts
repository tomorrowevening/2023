// Models
import dispatcher from '@ts/models/dispatcher';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Scenes
import BaseScene from '@ts/scenes/BaseScene';
import WelcomeScene from '@ts/scenes/welcome';

class SceneController {
  currentScene?: BaseScene;

  constructor() {
    dispatcher.addEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.addEventListener(Events.HIDE_SCENE, this.hideScene);
  }

  dispose() {
    this.currentScene?.dispose();
    dispatcher.removeEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.removeEventListener(Events.HIDE_SCENE, this.hideScene);
  }

  update() {
    this.currentScene?.update();
  }

  draw() {
    this.currentScene?.draw();
  }

  resize(width: number, height: number) {
    this.currentScene?.resize(width, height);
  }

  private showScene = (event: any) => {
    switch (event.scene) {
      case Scenes.WELCOME:
        this.currentScene = new WelcomeScene();
        break;
      case Scenes.INTRO:
        break;
    }
    this.currentScene?.init();
    this.currentScene?.resize(window.innerWidth, window.innerHeight);
    this.currentScene?.show();
  }

  private hideScene = (event: any) => {
  }
}

const scenes = new SceneController();
export default scenes;