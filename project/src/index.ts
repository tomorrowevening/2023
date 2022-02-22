// CSS
import '@scss/main.scss';
// Models
import { copyAssets, requiredFiles } from '@ts/models/load';
import { updateSettings } from '@ts/models/settings';
// Controllers
import App from '@ts/controllers/App';
// Utils
import debug from '@ts/utils/debug';
import loader from '@ts/utils/loader';

window.onload = () => {
  // Determine quality
  updateSettings().then(() => {
    if (debug.enabled) debug.init();
    
    // Load required files
    const loadingSection = document.getElementById('loading')!;
    const loadingText = loadingSection.querySelector('p')!;
    loader.loadAssets(requiredFiles, (progress: number) => {
      const loaded = Math.round(progress * 100);
      loadingText.innerHTML = `LOADING: ${loaded}%`;
    }).then((downloaded: any) => {
      copyAssets(downloaded);

      // HTML
      loadingSection.classList.add('hidden');
      const welcomeSection = document.getElementById('welcome')!;
      welcomeSection.classList.remove('hidden');

      const app = new App();
      app.init();
    });
  });
};