import Phaser from 'phaser';
import { GameConfig } from './config';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import MainMenuScene from './scenes/MainMenuScene';
import DailyRewardScene from './scenes/DailyRewardScene';
import SettingsScene from './scenes/SettingsScene';
import AchievementScene from './scenes/AchievementScene';
import LevelSelectionScene from './scenes/LevelSelectionScene';
import GameScene from './scenes/GameScene';
import ThemeStoreScene from './scenes/ThemeStoreScene';

// Oyun instance'ını başlat
const game = new Phaser.Game({
    ...GameConfig,
    scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        DailyRewardScene,
        SettingsScene,
        AchievementScene,
        LevelSelectionScene,
        GameScene,
        ThemeStoreScene
    ]
});

// For debugging
(window as any).game = game;

export default game;
