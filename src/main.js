import { AppView } from './view/appView.js';
import { VisionService } from './services/visionService.js';
import { AudioService } from './services/audioService.js';
import { AppPresenter } from './presenter/appPresenter.js';

const view    = new AppView();
const vision  = new VisionService();
const audio   = new AudioService();
const presenter = new AppPresenter(view, vision, audio);

presenter.init();
