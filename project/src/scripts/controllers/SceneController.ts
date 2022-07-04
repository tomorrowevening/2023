// Libs
import { ObjectLoader, Scene } from 'three';
import { dispose } from 'tomorrow_web/utils/three';
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
import debug from '@ts/utils/debug';

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
    this.uiScene.enable();
    dispatcher.addEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.addEventListener(Events.SCENE_HIDDEN, this.sceneHidden);
  }

  dispose() {
    this.currentScene?.dispose();
    this.nextScene?.dispose();
    this.uiScene.disable();
    dispose(this.uiScene);
    dispatcher.removeEventListener(Events.SHOW_SCENE, this.showScene);
    dispatcher.removeEventListener(Events.SCENE_HIDDEN, this.sceneHidden);
  }

  initDebug() {
    const config = {
      import: '',
    };
    let importInput;
    debug.addButton(debug.presetTab, 'Export Scene', () => {
      config.import = JSON.stringify(this.currentScene?.scene.toJSON());
      console.log(config.import);
      importInput.controller_.binding.target.write(config.import);
      importInput.refresh();
    });
    debug.addButton(debug.presetTab, 'Import Scene', () => {
      const json = JSON.parse(config.import);
      const loader = new ObjectLoader()
      const scene = loader.parse(json) as Scene;
      this.currentScene?.setScene(scene);
    });
    importInput = debug.addInput(debug.presetTab, config, 'import');
  }

  update() {
    this.currentScene?.update();
  }

  draw() {
    // const mainRT = gl.renderTargets.get('main')!;
    // this.currentScene?.draw(mainRT);
    // this.uiScene.draw();
    // this.compositeScene.draw();
    this.currentScene?.draw(null);
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
      // console.log('hide current scene', this.currentScene.sceneType);
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
    // console.log('showNextScene::', this.nextScene?.sceneType);
    this.currentScene = this.nextScene;
    this.nextScene = undefined;
    this.currentScene?.init();
    this.currentScene?.resize(window.innerWidth, window.innerHeight);
    this.currentScene?.show();
  }
}

const scenes = new SceneController();
export default scenes;