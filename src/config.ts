import Phaser from 'phaser';

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 375,
    height: 812, // iPhone X boyutları referans
    parent: 'app',
    backgroundColor: '#F5F7FA', // Light mode background
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // dikey yerine nesne olarak x, y verilmeli
            debug: false
        }
    },
    // Scene'ler main.ts içinde eklenecek
};
