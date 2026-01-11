import Phaser from 'phaser';
import { GameConfig } from './config';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';

// Oyun instance'ını başlat
const game = new Phaser.Game({
    ...GameConfig,
    scene: [BootScene, PreloaderScene]
});

export default game;
