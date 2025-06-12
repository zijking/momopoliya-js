import map from './map.js'
import { player } from './playerMove.js';

map.buildMap();
setTimeout(player.startPosition, 1500);
