// CSS
import '@scss/main.scss';

// Models
import { updateSettings } from '@ts/models/settings';
import gl from '@ts/models/three';
// Controllers
import BaseApp from '@ts/controllers/apps/BaseApp'
import SpotifyApp from '@ts/controllers/apps/SpotifyApp'
import WebsiteApp from '@ts/controllers/apps/WebsiteApp';
// Utils
import debug from '@ts/utils/debug';

window.onload = () => {
  updateSettings().then(() => {
    if (debug.enabled) debug.init();
    gl.init();

    let currentApp: BaseApp | null = null
    debug.addOptions(
      debug.parent,
      'App',
      [
        {
          text: 'None',
          value: null,
        },
        {
          text: 'Spotify',
          value: SpotifyApp,
        },
        {
          text: 'Website',
          value: WebsiteApp,
        },
      ],
      (value: any) => {
        if (currentApp !== null) currentApp.dispose()
        currentApp = null
        if (value !== null) {
          currentApp = new value()
        }
      }
    )
  });
};