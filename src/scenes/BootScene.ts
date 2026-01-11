import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Logo ve loading bar gibi temel assetler burada yüklenecek
        // this.load.image('logo', 'assets/images/logo.png');
    }

    create() {
        console.log('BootScene started');
        // Preloader sahnesine geçiş
        this.scene.start('PreloaderScene');
    }
}
