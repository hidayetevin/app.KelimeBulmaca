import Phaser from 'phaser';
import { SCENES } from '@/utils/constants';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload() {
        // Splash screen veya logo için asset yükle
        // Şimdilik sadece text tabanlı splash olacağı için gerek yok
        // Ama loading bar için basit bir beyaz kutu üretebiliriz texture olarak
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('white_box', 32, 32);
    }

    create() {
        console.log('BootScene started');
        this.scene.start(SCENES.PRELOADER);
    }
}
