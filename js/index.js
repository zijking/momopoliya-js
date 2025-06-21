import map from './map.js'
import { playerMain } from "./playerMove.js";

map.buildMap();
setTimeout(playerMain.startPosition, 1500);
