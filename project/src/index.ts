// CSS
import '@scss/main.scss';
// Models
import { assets, requiredFiles } from '@ts/models/load';
import { updateSettings } from '@ts/models/settings';
import gl from '@ts/models/three';
// Controllers
import App from '@ts/controllers/App';
// Utils
import debug from '@ts/utils/debug';
import loader from '@ts/utils/loader';

window.onload = () => {
  // Determine quality
  updateSettings().then(() => {
    if (debug.enabled) debug.init();
    gl.init();
    
    // Load required files
    const loadingSection = document.getElementById('loading')!;
    const loadingText = loadingSection.querySelector('p')!;
    loader.loadAssets(requiredFiles, (progress: number) => {
      const loaded = Math.round(progress * 100);
      loadingText.innerHTML = `LOADING: ${loaded}%`;
    }).then(() => {
      // HTML
      loadingSection.classList.add('hidden');
      const welcomeSection = document.getElementById('welcome')!;
      welcomeSection.classList.remove('hidden');

      const app = new App();
      app.init();
    });
  });
};