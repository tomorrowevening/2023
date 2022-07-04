// Libs
import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Vector3
} from 'three'
import { mix, normalize } from 'tomorrow_web/utils/math';
import TextMesh from 'tomorrow_web/three/mesh/TextMesh';
// Models
import { Section } from '@ts/models/audio/analysis';
import { assets } from '@ts/models/load';

export default class SectionsMesh extends Line {
  constructor(data: Array<Section>) {
    const name = 'Sections';
    const vertices: Array<Vector3> = [];
    const total = data.length;
    if (data[0].start > 0) {
      vertices.push(new Vector3(0, 0, 0));
      vertices.push(new Vector3(0, 0, data[0].start));
    }
    for (let i = 0; i < total; i++) {
      const section = data[i];
      const start = section.start;
      const end = start + section.duration;
      const key = normalize(-1, 11, section.key)
      const loudness = normalize(-60, 0, section.loudness);
      const x = mix(-0.5, 0.5, key)
      vertices.push(new Vector3(x, loudness, start));
      vertices.push(new Vector3(x, loudness, end));
    }
    const geometry = new BufferGeometry().setFromPoints(vertices);
    const material = new LineBasicMaterial( { color: 0xffff00 } );
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
