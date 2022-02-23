import { AnimationAction, AnimationClip, AnimationMixer, Camera, LoopOnce, LoopRepeat, Object3D, } from 'three';
// @ts-ignore
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import debug from '@ts/utils/debug';
import { dispose } from 'tomorrow_web/utils/three';
import { clamp, normalize } from 'tomorrow_web/utils/math';

/**
 * Wrapper class for GLTF Loading / Animation
 * @author Colin Duffy
 */
export default class GLTFPlayer {
  actions = new Map();

  animations: Map<string, object> = new Map();

  scene?: Object3D;

  cameras: Array<Camera> = [];

  loaded: boolean = false;

  name: string = 'GLTFPlayer';

  mixer?: AnimationMixer;

  timeScale: number = 1;

  current: string = '';

  transition = {
    active: false,
    from: '',
    to: '',
    timeout: undefined,
    startTime: 0,
    endTime: 0,
    progress: 0
  };

  dispose() {
    if (!this.loaded) return;
    dispose(this.scene!);
    // Reset
    this.scene = undefined;
    this.actions = new Map();
    this.animations = new Map();
    this.cameras = [];
    this.current = '';
    this.loaded = false;
    this.mixer = undefined;
    this.timeScale = 1;
    this.transition.active = false;
    this.transition.from = '';
    this.transition.to = '';
    this.transition.timeout = undefined;
  }

  crossFade(start: string, end: string, duration: number, synchronize: boolean = false, onComplete?: () => void) {
    // Transition
    if (start === this.transition.from && end === this.transition.to) return;
    this.transition.active = true;
    this.transition.from = start;
    this.transition.to = end;
    this.transition.progress = 0;

    const startAction = this.actions.get(start);
    const endAction = this.actions.get(end);
    startAction.paused = false;
    endAction.paused = false;

    const fade = () => {
      this.setWeight(endAction, 1);
      endAction.time = 0;
      startAction.crossFadeTo(endAction, duration, true);
      this.transition.startTime = Date.now();
      this.transition.endTime = this.transition.startTime + (duration * 1000);
      this.transition.progress = 0;
      // Complete
      // @ts-ignore
      this.transition.timeout = setTimeout(() => {
        clearTimeout(this.transition.timeout)
        this.transition.timeout = undefined;
        this.transition.active = false;
        this.transition.progress = 1;
        this.transition.from = '';
        this.transition.to = '';
        this.current = end;
        if (onComplete) {
          const endLopped = (evt: any) => {
            this.mixer?.removeEventListener('finished', endLopped);
            onComplete();
          }
          this.mixer?.addEventListener('finished', endLopped);
          this.setLoop(end, false);
        }
      }, duration * 1000);
    }

    // Wait until animation is complete
    if (synchronize) {
      const onLoop = (evt: any) => {
        this.mixer?.removeEventListener('loop', onLoop);
        if (evt.action === startAction) {
          fade();
        }
      }
      this.mixer?.addEventListener('loop', onLoop);
    } else {
      fade();
    }
  }

  crossFadeTo(name: string, duration: number, synchronize: boolean = false, onComplete?: () => void) {
    if (this.current.length > 0 && this.current !== name) {
      this.crossFade(this.current, name, duration, synchronize, onComplete);
    }
  }

  /**
   * Sets the GLTF object
   * @param gltf An object with animations (Array<AnimationClip>), asset (Object),
   * scene (Group), scenes (Array<Group>), and cameras (Array<Camera>)
   */
  setGLTF(gltf: GLTF) {
    // Assign
    this.scene = gltf.scene;
    // this.scene = clone(gltf.scene);
    this.cameras = gltf.cameras;
    console.log('>>>', gltf.scene, this.scene);

    // Setup mixer
    this.mixer = new AnimationMixer(this.scene!);

    // Add animations to mixer
    const animations: Array<any> = [];
    //
    gltf.scene.userData.animations.forEach((animation: AnimationClip) => {
      // Retrieve actions by name :)
      const action = this.mixer!.clipAction(animation);
      action.weight = 0;
      action.play();
      this.actions.set(animation.name, action);
      this.animations.set(animation.name, animation);
      animations.push({
        text: animation.name,
        value: animation.name,
      });
    });
    //

    this.loaded = true;

    if (debug.enabled) {
      const folder = debug.folder(`GLTF ${this.name}`, false, debug.parent);
      debug.addInput(folder, this, 'timeScale', {
        min: 0,
        max: 2,
        step: 0.01,
        label: 'Time'
      });
      const debugAnimations = false;
      if (debugAnimations && animations.length > 0) {
        debug.addOptions(folder, 'Animations', animations, (value: string) => {
          this.pauseAllActions();
          this.play(value);
        });
        animations.forEach((animation: any) => {
          debug.addInput(folder, this.actions.get(animation.value), 'weight', {
            min: 0,
            max: 1,
            step: 0.01,
            label: animation.value,
            onChange: (value: number) => {
              const action = this.actions.get(animation.value);
              action.enabled = value > 0;
              if (value > 0) {
                action.play();
              } else if (!action.paused && value === 0) {
                action.stop();
              }
            }
          });
        });
      }
    }
  }

  play(name: string, loop: boolean = true, repetitions: number = Infinity) {
    if (name === this.current) return;
    // if (this.current.length > 0) {
    //   console.log('>', name, this.current);
    //   this.stop(this.current);
    // }
    const action = this.actions.get(name);
    if (action !== undefined) {
      this.current = name;
      this.setWeight(action, 1);
      this.setLoop(name, loop, repetitions);
      action.play();
    }
  }

  stop(name: string) {
    this.current = '';
    const action = this.actions.get(name);
    if (action !== undefined) {
      this.setWeight(action, 0);
      // action.stop();
    }
  }

  setWeight(action: AnimationAction, weight: number) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  setLoop(name: string, loop: boolean = true, repetitions: number = Infinity) {
    const action = this.actions.get(name);
    if (action !== undefined) {
      if (loop) {
        action.setLoop(LoopRepeat, repetitions);
      } else {
        action.setLoop(LoopOnce, 0);
        action.clampWhenFinished = true;
      }
    }
  }

  /**
   * Updates the Animation Mixer
   * @param delta Time since last update
   */
  update(delta: number) {
    if (this.loaded) {
      this.mixer!.timeScale = this.timeScale;
      if (this.transition.active) {
        this.transition.progress = clamp(0, 1, normalize(this.transition.startTime, this.transition.endTime, Date.now()));
      }
      this.mixer!.update(delta);
    }
  }

  pauseAllActions() {
    for (let i in this.actions) {
      const action = this.actions[i];
      action.paused = true;
    }
  }

  unPauseAllActions() {
    for (let i in this.actions) {
      const action = this.actions[i];
      action.paused = false;
    }
  }

  static loadGLTF(path: string, onProgress: (value: number) => void) {
    return new Promise((resolve, reject) => {
      const modelLoader = new GLTFLoader();
      modelLoader.load(
        path,
        (gltf) => {
          if (gltf.scene) {
            if (gltf?.animations) {
              gltf.scene.userData.animations = new Map<string, AnimationClip>();
              gltf.animations.forEach((anim: AnimationClip) => {
                gltf.scene.userData.animations.set(anim.name, anim);
              });
            }
          }
          resolve(gltf);
        },
        (event) => {
          if (onProgress) onProgress(event.loaded / event.total);
        },
        () => {
          reject();
        },
      );
    });
  }
}