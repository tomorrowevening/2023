// Libs
import {
  BladeApi,
  BladeController,
  ButtonApi,
  InputBindingApi,
  MonitorBindingApi,
  View
} from '@tweakpane/core';
import {
  FolderApi,
  ListApi,
  Pane,
  TabApi,
  TabPageApi
} from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin';
import {
  RepeatWrapping,
  Texture
} from 'three';
// Models
import gl from '@ts/models/three';

function cleanName(name: string) {
  return name.replace(/\s/g, '');
}

interface InputPoint {
  expanded?: boolean;
  inverted?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface InputProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  x?: InputPoint;
  y?: InputPoint;
  disabled?: boolean;
  onChange?: (value: any) => void
}

/**
 * Single Debugging object to house dat.gui & stats
 */
export class Debugger {
  enabled: boolean = process.env.NODE_ENV === 'development';

  gui!: Pane;

  stats!: any;

  folders: Object = {};

  tabs!: TabApi;

  init() {
    if (!this.enabled) return;

    this.gui = new Pane();
    this.gui.registerPlugin(EssentialsPlugin);
    this.gui.registerPlugin(TweakpaneImagePlugin);

    this.addButton(undefined, 'Toggle', () => {
      this.tabs.hidden = !this.tabs.hidden;
    });

    this.addButton(undefined, 'Export', () => {
      this.export();
    });

    this.stats = this.gui.addBlade({
      view: 'fpsgraph'
    });

    this.tabs = this.gui.addTab({
      pages: [
        { title: 'System' },
        { title: 'Experience' },
      ],
    });
  }

  initSystem() {
    const parent = this.tabs.pages[0];

    const folder = debug.folder('Performance', false, parent);
    const speed = 1000 / 10;
    debug.addMonitor(folder, gl.renderer.info.render, 'calls', {
      interval: speed,
      label: 'DrawCalls'
    });
    debug.addMonitor(folder, gl.renderer.info.render, 'lines', {
      interval: speed,
      label: 'Lines'
    });
    debug.addMonitor(folder, gl.renderer.info.render, 'points', {
      interval: speed,
      label: 'Points'
    });
    debug.addMonitor(folder, gl.renderer.info.render, 'triangles', {
      interval: speed,
      label: 'Tris'
    });
    debug.addMonitor(folder, gl.renderer.info.memory, 'geometries', {
      interval: speed,
      label: 'Geom'
    });
    debug.addMonitor(folder, gl.renderer.info.memory, 'textures', {
      interval: speed,
      label: 'Textures'
    });
    debug.addMonitor(folder, gl.renderer.info.programs, 'length', {
      interval: speed,
      label: 'Programs'
    });
  }

  /**
   * To be called before updating/rendering
   */
  begin() {
    if (!this.enabled) return;
    this.stats.begin();
  }

  /**
   * To be called after updating/rendering
   */
  end() {
    if (!this.enabled) return;
    this.stats.end();
  }

  export() {
    const iterateFolder = (folder: any, parent: any) => {
      folder.children.forEach((child: any) => {
        if (child instanceof FolderApi) {
          const name = cleanName(child.title!);
          const newFolder = {};
          parent[name] = {};
          iterateFolder(child, newFolder);
        } else if (child instanceof ListApi) {
          const name = cleanName(child.label!);
          parent[name] = child.value;
        } else {
          const binding = child.controller_.binding;
          const name = cleanName(binding.target.key);
          let value = binding.target.obj_[name];
          if (value instanceof Image) {
            value = value.src;
          } else if (typeof value === 'number') {
            value = Number(value.toFixed(4));
          }
          parent[name] = value;
        }
      });
    };
    const preset = {};
    iterateFolder(this.parent, preset);
    // eslint ignore
    console.log(JSON.stringify(preset));
  }

  /**
   * Retrieves or creates the GUI folder
   * @param name The name of the founder
   * @param expanded If the folder should be expanded or not
   */
  folder(name: string, expanded: boolean = false, parent?: FolderApi | TabPageApi) {
    // If a folder with the same name already exists, return that folder
    if (this.folders[name]) {
      return this.folders[name];
    }

    const usedGUI = parent !== undefined ? parent : this.gui;
    const folder = usedGUI.addFolder({
      title: name,
      expanded: expanded
    });

    this.folders[name] = folder;
    return this.folders[name];
  }

  /**
   * Adds a button
   * @param folder An optional folder
   * @param label The button's label
   * @param callback The callback function
   * @returns The created GUI
   */
  addButton(folder: FolderApi | TabPageApi | undefined, label: string, callback: () => void): ButtonApi {
    const gui = folder !== undefined ? folder : this.gui;
    const btn = gui.addButton({
      title: label
    });
    btn.on('click', callback);
    return btn;
  }

  /**
   * A color to debug
   * @param folder An optional folder
   * @param obj The object with the value
   * @param value The value you want to modify/listen to
   * @param props Optional predefined options
   * @returns The created GUI
   */
  addColor(
    folder: FolderApi | TabPageApi | undefined,
    obj: any,
    value: string,
    props?: any
  ): InputBindingApi<unknown, any> {
    const usedGUI = folder !== undefined ? folder : this.gui;
    const added = usedGUI.addInput(obj, value, {
      label: props.label !== undefined ? props.label : value
    });

    if (props !== undefined) {
      if (props.onChange !== undefined) {
        added.on('change', (evt) => {
          props.onChange(evt.value);
        });
      }
    }

    return added;
  }

  /**
   * A list of items
   * @param folder An optional folder
   * @param label The option's label
   * @param options The array of options
   * @param callback The callback function
   * @returns The created GUI
   */
  addOptions(
    folder: FolderApi | TabPageApi | undefined,
    label: string,
    options: Array<any>,
    callback: (value: any) => void
  ): BladeApi<BladeController<View>> {
    const usedGUI = folder !== undefined ? folder : this.gui;
    const added = usedGUI.addBlade({
      view: 'list',
      label: label,
      options: options,
      value: options[0].value,
    });
    // @ts-ignore
    added.on('change', (evt: any) => {
      callback(evt.value);
    });
    return added;
  }

  /**
   * An object to debug
   * @param folder An optional folder
   * @param obj The object with the value
   * @param value The value you want to modify/listen to
   * @param props Optional predefined options
   * @returns The created GUI
   */
  addInput(
    folder: FolderApi | TabPageApi | undefined,
    obj: any,
    value: string,
    props?: InputProps
  ): InputBindingApi<unknown, any> {
    const usedGUI = folder !== undefined ? folder : this.gui;
    const properties = {};
    if (props !== undefined) {
      if (props.label !== undefined) properties['label'] = props.label;
      if (props.min !== undefined) {
        properties['min'] = props.min;
        properties['max'] = props.max;
        if (props.step !== undefined) properties['step'] = props.step;
      }
      if (props.x !== undefined) properties['x'] = props.x;
      if (props.y !== undefined) properties['y'] = props.y;
      if (props.disabled !== undefined) properties['disabled'] = props.disabled;
    }
    const added = usedGUI.addInput(obj, value, properties);
    if (props !== undefined && props.onChange !== undefined) {
      added.on('change', (evt) => {
        if (props.onChange) props.onChange(evt.value);
      });
    }

    return added;
  }

  /**
   * An object to debug
   * @param folder An optional folder
   * @param obj The object with the value
   * @param value The value you want to modify/listen to
   * @param props Optional predefined options
   * @returns The created monitor
   */
  addMonitor(
    folder: FolderApi | TabPageApi | undefined,
    obj: any,
    value: string,
    props?: any
  ): MonitorBindingApi<any> {
    const usedGUI = folder !== undefined ? folder : this.gui;
    return usedGUI.addMonitor(obj, value, props);
  }

  addToggle(folder: FolderApi | TabPageApi | undefined, label: string, onChange: (value: any) => void) {
    const gui = folder !== undefined ? folder : this.gui;
    const params = { value: true };
    const added = gui.addInput(params, 'value', { label });
    added.on('change', (evt) => {
      onChange(evt.value);
    });
    return added;
  }

  addTextFile(
    folder: FolderApi | TabPageApi | undefined,
    label: string,
    onLoad: (result: any, file: File) => void,
    type: string = 'application/json'
  ) {
    this.addButton(folder, label, () => {
      const fileInput = document.createElement('input');
      fileInput.accept = type;
      fileInput.style.display = 'none';
      fileInput.type = 'file';
      fileInput.name = 'file';
      fileInput.onchange = () => {
        const fileReader = new FileReader();
        // @ts-ignore
        fileReader.onload = () => { return onLoad(fileReader.result, fileInput.files[0]); };
        // @ts-ignore
        fileReader.readAsText(fileInput.files[0]);
      };
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    });
  }

  addImage(folder: FolderApi | TabPageApi | undefined, label: string, props: any) {
    const gui = folder !== undefined ? folder : this.gui;
    const hasImage = props.image !== undefined;
    const params = {};
    let type = 'placeholder';
    if (hasImage) {
      type = 'image';
      params['image'] = props.image;
    } else {
      params['placeholder'] = 'placeholder';
    }
    // @ts-ignore
    const added = gui.addInput(params, type, {
      view: 'input-image',
      label: label,
      ...props,
    });
    if (props !== undefined && props.onChange !== undefined) {
      let changed = false;
      added.on('change', (evt) => {
        if (changed) {
          if (props.texture) {
            // @ts-ignore
            const texture = new Texture(evt.value);
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.needsUpdate = true;
            // TODO: Assign original filename somehow
            // @ts-ignore
            texture.userData = { url: evt.value.src };
            props.onChange(texture);
          } else {
            props.onChange(evt.value);
          }
        }
        changed = true;
      });
    }
    return added;
  }

  removeFolder(name: string) {
    const folder = this.folders[name];
    if (!folder) return;
    folder.dispose();
    delete this.folders[name];
  }

  get parent() {
    return this.tabs.pages[1];
  }
}

const debug = new Debugger();
export default debug;