// Libs
import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneBufferGeometry } from 'three';
import gsap from 'gsap';
import { anchorGeometryTL, dispose, orthoCamera, updateCameraOrtho } from 'tomorrow_web/utils/three';
import { delay } from 'tomorrow_web/utils/dom';
// Models
import dispatcher from '@ts/models/dispatcher';
import { files } from '@ts/models/load';
import gl from '@ts/models/three';
import { Events, Scenes } from '@ts/models/types';
// Views
import BaseScene from '@ts/scenes/BaseScene';
import WelcomeMaterial from './WelcomeMaterial';
import LoadBar from './LoaderMesh';
// Utils
import loader from '@ts/utils/loader';
import smoothing from 'tomorrow_web/animation/Smooth';

let bgMesh;

export default class WelcomeScene extends BaseScene {
  bgMaterial!: WelcomeMaterial;

  private sectionElement: HTMLElement;
  private button: HTMLButtonElement;

  private loadBar!: LoadBar;

  private loading = {
    complete: false,
    waiting: false
  };

  constructor() {
    super(Scenes.WELCOME);
    this.camera = orthoCamera.clone();
    this.sectionElement = document.getElementById('welcome')!;
    this.button = this.sectionElement.querySelector('button')!;
  }

  override init(): void {
    super.init();
    const onClick = () => {
      this.button.removeEventListener('click', onClick);
      if (this.loading.complete) {
        this.gotoNextScene();
      } else {
        this.loading.waiting = true;
      }
    };
    this.button.addEventListener('click', onClick, false);
  }

  override initScene(): void {
    this.bgMaterial = new WelcomeMaterial();
    const geom = new PlaneBufferGeometry(1, 1, 1, 1);
    anchorGeometryTL(geom);
    bgMesh = new Mesh(geom, this.bgMaterial);
    // bgMesh.visible = false
    this.scene.add(bgMesh);

    this.loadBar = new LoadBar();
  }

  override draw(): void {
    this.bgMaterial.update(this.clock.getDelta());
    // const renderTarget = gl.renderTargets.get('main');
    // if (renderTarget) gl.renderer.setRenderTarget(renderTarget);
    // gl.renderer.clear();
    gl.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) {
    this.loadBar.position.x = (width / 2) - (this.loadBar.width / 2);
    updateCameraOrtho(this.camera as OrthographicCamera, width, height);
    bgMesh.scale.set(width, height);
  }

  override show(): void {
    super.show();
    this.bgMaterial.show();
    delay(0.5).then(() => {
      this.beginLoad();
      this.sectionElement.classList.add('visible');
    });
  }

  override hide(): void {
    this.sectionElement.classList.remove('visible');
    this.bgMaterial.hide();
    delay(0.5).then(() => {
      this.sectionElement.classList.add('hidden');
      dispatcher.dispatchEvent({ type: Events.SCENE_HIDDEN });
    });
  }

  private gotoNextScene() {
    dispatcher.dispatchEvent({
      type: Events.SHOW_SCENE,
      scene: Scenes.INTRO
    });
  }

  private beginLoad() {
    this.loadBar.show();
    this.scene.add(this.loadBar);

    delay(1.5).then(() => {
      // start loading
      const smoothID = 'loadProgress';
      loader.loadAssets(
        files,
        (progress: number) => {
          smoothing.to(this.loadBar, 'progress', {
            id: smoothID,
            precision: 0.1,
            speed: 0.1,
            target: progress * 100,
            onUpdate: () => {
              // Load complete
              if (this.loadBar.progress === 100) {
                smoothing.remove(smoothID);
                this.loadBar.opacity = 1;
                gsap.to(this.loadBar, {
                  opacity: 0,
                  duration: 1,
                  onComplete: () => {
                    delay(1).then(() => {
                      console.log('remove');
                      dispose(this.loadBar);
                      this.loading.complete = true;
                      if (this.loading.waiting) {
                        this.gotoNextScene();
                      }
                    });
                  }
                });
              }
            }
          });
        }
      ).then(() => {
        console.log('load complete');
      });
    });
  }
}
