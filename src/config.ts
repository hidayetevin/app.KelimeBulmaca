import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants';

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'app',
    backgroundColor: '#F5F7FA',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },


    render: {
        // Pikselli görüntü yerine yumuşak kenarlar
        antialias: true,
        // Pixel art olmadığı için false
        pixelArt: false,
        // Akıcı animasyonlar için false
        roundPixels: false
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
};
