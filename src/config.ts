import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants';

export const GameConfig: any = {
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
        roundPixels: true
    },
    // Yüksek çözünürlük desteği
    // Yüksek çözünürlük desteği (Minimum 3x kaliteye zorla)
    resolution: Math.max(window.devicePixelRatio, 3),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
};
