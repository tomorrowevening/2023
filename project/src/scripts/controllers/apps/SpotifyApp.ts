// Utils
import {
  BufferGeometry,
  Camera,
  CameraHelper,
  GridHelper,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  PerspectiveCamera,
  Scene,
  SphereBufferGeometry,
  MeshNormalMaterial,
  DoubleSide,
  Vector3,
  MathUtils,
  Clock,
  Texture
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// Utils
import { anchorGeometry } from 'tomorrow_web/utils/three'
import debug from '@ts/utils/debug';
import loader from '@ts/utils/loader'
// Models
import { assets } from '@ts/models/load';
import gl from '@ts/models/three';
import { Song } from '@ts/models/audio/analysis';
// Views
import MeasureMesh from '@ts/views/spotify/MeasureMesh'
import SectionsMesh from '@ts/views/spotify/SectionsMesh'
// Controllers
import BaseApp from './BaseApp'

const zPlane = new PlaneBufferGeometry()
anchorGeometry(zPlane, 0, 0.5, 0);

type CamerasType = {
  frustumSize: number
  debug: PerspectiveCamera
  debugHelper?: CameraHelper
  main: OrthographicCamera
  mainHelper?: CameraHelper
}

export default class SpotifyApp extends BaseApp {
  song!: Song

  config = {
    progress: 0,
    playing: false,
    scroll: false
  };

  clock: Clock;

  camera: Camera

  scene: Scene

  loaded = false

  audioFolder: any

  controls: OrbitControls

  private floor: Mesh;
  private gridHelper!: GridHelper;
  private cameras: CamerasType;

  constructor() {
    super()

    this.scene = new Scene()

    this.cameras = {
      frustumSize: 4,
      debug: new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000),
      main: new OrthographicCamera(
        window.innerWidth / - 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / - 2,
        0.001, 1000,
      ),
    }

    this.cameras.debug.position.set(-3, 2, -3);
    this.cameras.main.position.set(-5, 1.5, 0);
    this.cameras.main.rotateY(MathUtils.degToRad(-90));
    this.cameras.main.rotateX(MathUtils.degToRad(-15));
    // this.cameras.main.rotateY(MathUtils.degToRad(-90));
    // this.cameras.main.rotateX(MathUtils.degToRad(30));
    // this.cameras.main.lookAt(0, 0, 0);
    // console.log(this.cameras.main.rotation)

    if (debug.enabled) {
      this.cameras.debugHelper = new CameraHelper(this.cameras.debug);
      this.scene.add(this.cameras.debugHelper);
      this.cameras.mainHelper = new CameraHelper(this.cameras.main);
      this.scene.add(this.cameras.mainHelper);
    }

    this.camera = this.cameras.debug;

    this.controls = new OrbitControls(this.cameras.debug, gl.renderer.domElement);

    this.clock = new Clock();

    this.floor = new Mesh(zPlane, new MeshBasicMaterial({
      color: 0x111111,
    }));
    this.floor.position.y = -0.01;
    this.floor.rotateX(-Math.PI / 2);
    this.scene.add(this.floor);

    this.init()
  }

  override init() {
    super.init()
    const files = [
      {
        type: 'json',
        file: 'json/song.json'
      },
      {
        type: 'json',
        file: 'json/VarelaRound-Regular.json'
      },
      {
        type: 'texture',
        file: 'images/fonts/VarelaRound-Regular.png'
      },
    ];
    loader.loadAssets(files, () => { }).then(() => {
      const song = assets.json['song'] as Song
      this.createSong(song);
    })
  }

  override dispose() {
    super.dispose()
  }

  createSong = (song: Song) => {
    console.log('>', song)
    this.song = song

    // Floor
    this.floor.scale.y = this.song.track.duration;

    // Grid
    this.gridHelper = new GridHelper(this.song.track.duration, Math.floor(this.song.track.duration / 10));
    this.gridHelper.position.z = this.song.track.duration / 2;
    this.scene.add(this.gridHelper);

    this.createDebug();

    // Track

    // Bars
    const bars = new MeasureMesh('bars', 0x9999ff, this.song.bars);
    bars.position.x = 0;
    this.scene.add(bars);

    // Bars
    const beats = new MeasureMesh('beats', 0xff88ff, this.song.beats);
    beats.position.x = 1;
    this.scene.add(beats);

    // Sections
    const sections = new SectionsMesh(this.song.sections)
    sections.position.x = 2;
    this.scene.add(sections);

    // Segments

    // Tatums
    /**
     * Removing this since it looks the same as beats
     * Currently receiving the same info as beats, but doubled up - maybe a new song will see difference?
     */
    // const tatums = new MeasureMesh('tatums', 0x00cc77, this.song.tatums);
    // tatums.position.x = 2;
    // this.scene.add(tatums);

    this.loaded = true;
  }

  createDebug() {
    this.audioFolder = debug.folder('Audio', true, debug.parent);
    const playingInput = debug.addInput(this.audioFolder, this.config, 'playing');
    const scrollInput = debug.addInput(this.audioFolder, this.config, 'scroll');
    const progressInput = debug.addInput(this.audioFolder, this.config, 'progress', {
      min: 0,
      max: 1
    });
    debug.addButton(this.audioFolder, 'Play', () => {
      this.clock.start();
      this.config.progress = 0;
      this.config.playing = true;
      this.config.scroll = false;
      playingInput.controller_.binding.target.write(this.config.playing);
      playingInput.refresh();
      progressInput.controller_.binding.target.write(this.config.progress);
      progressInput.refresh();
      scrollInput.controller_.binding.target.write(this.config.scroll);
      scrollInput.refresh();
    });
    debug.addInput(this.audioFolder, this.controls, 'enabled', { label: 'Controls' });
    debug.addInput(this.audioFolder, this.cameras.debugHelper, 'visible', { label: 'Debug Helper' });
    debug.addInput(this.audioFolder, this.cameras.mainHelper, 'visible', { label: 'Main Helper' });
    debug.addOptions(
      this.audioFolder,
      'Camera',
      [
        {
          text: 'Debug',
          value: this.cameras.debug,
        },
        {
          text: 'Main',
          value: this.cameras.main,
        }
      ],
      (value: Camera) => {
        this.camera = value;
        this.controls.object = this.camera;
        // this.controls.enabled = value === this.cameras.debug;
        // console.log('cam', this.controls.enabled, value)
      }
    );
  }

  update() {
    if (!this.loaded) return

    if (this.config.playing) {
      const time = this.clock.getElapsedTime();
      this.camera.position.z = time;
    } else if (this.config.scroll) {
      const time = this.config.progress * this.song.track.duration;
      this.camera.position.z = time;
    } else {
      this.controls.update()
    }
  }

  draw() {
    super.draw()
    gl.renderer.render(this.scene, this.camera)
  }

  resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    gl.resize(width, height);

    this.cameras.debug.aspect = aspect;
    this.cameras.debug.updateProjectionMatrix()

    this.cameras.main.left = -this.cameras.frustumSize * aspect / 2;
    this.cameras.main.right = this.cameras.frustumSize * aspect / 2;
    this.cameras.main.top = this.cameras.frustumSize / 2;
    this.cameras.main.bottom = - this.cameras.frustumSize / 2;
    this.cameras.main.updateProjectionMatrix();
  }
}

/**
 * Bar: a single unit of time containing a specific number of beats played at a particular tempo
 * Beat: the basic rhythmic unit of a measure, or bar
 * Section: a complete, but not independent, musical idea
 * Tatum: the smallest time interval between successive notes in a rhythmic phrase
 * Beats = Tatums / 2
 * Bars = Beats / 4
 */