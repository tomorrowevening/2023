// Libs
import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Vector3
} from 'three'
import TextMesh from 'tomorrow_web/three/mesh/TextMesh';
// Models
import { Track } from '@ts/models/audio/analysis';
import { assets } from '@ts/models/load';

export default class TrackMesh extends Line {
  constructor(color: number, data: Track) {
    const name = 'Track';
    const bpm = 60 / data.tempo
    const vertices: Array<Vector3> = [];
    // const total = data.length;
    // if (data[0].start > 0) {
    //   vertices.push(new Vector3(0, 0, 0));
    //   vertices.push(new Vector3(0, 0, data[0].start));
    // }
    // for (let i = 0; i < total; i++) {
    //   const measure = data[i];
    //   const start = measure.start;
    //   const end = start + measure.duration;
    //   const intensity = measure.confidence;
    //   vertices.push(new Vector3(0, intensity, start));
    //   vertices.push(new Vector3(0, intensity, end));
    // }
    const geometry = new BufferGeometry().setFromPoints(vertices);
    const material = new LineBasicMaterial( { color: color } );
    super(geometry, material);
    this.name = name;

    // Tag
    const json = assets.json['VarelaRound-Regular']
    const texture = assets.textures['VarelaRound-Regular']
    const config = {
      font: json,
      text: name
    }
    const text = new TextMesh();
    text.map = texture;
    text.update(config);
    text.rotateY(-Math.PI / 2)
    text.scale.setScalar(0.004)
    text.position.x = -0.1;
    this.add(text);
  }
}