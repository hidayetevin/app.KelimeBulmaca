import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';
import { GAME_WIDTH, FONT_FAMILY_PRIMARY } from '@/utils/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number;
    icon?: string;
}

interface QueuedToast {
    config: ToastConfig;
    resolve: () => void;
}

/**
 * Toast Notification System - Singleton
 * Displays brief messages at the top of the screen
 */
export default class Toast {
    private static instance: Toast;
    private scene!: Phaser.Scene;
    private container?: Phaser.GameObjects.Container;
    private queue: QueuedToast[] = [];
    private isShowing = false;
    private colors = LIGHT_COLORS;

    private constructor() { }

    public static getInstance(): Toast {
        if (!Toast.instance) {
            Toast.instance = new Toast();
        }
        return Toast.instance;
    }

    /**
     * Initialize with a scene reference
     */
    public init(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Show a toast notification
     */
    public show(config: ToastConfig): Promise<void> {
        return new Promise((resolve) => {
            this.queue.push({ config, resolve });
            if (!this.isShowing) {
                this.processQueue();
            }
        });
    }

    /**
     * Convenience methods
     */
    public success(message: string, duration?: number) {
        return this.show({ message, type: 'success', duration, icon: '✅' });
    }

    public error(message: string, duration?: number) {
        return this.show({ message, type: 'error', duration, icon: '❌' });
    }

    public warning(message: string, duration?: number) {
        return this.show({ message, type: 'warning', duration, icon: '⚠️' });
    }

    public info(message: string, duration?: number) {
        return this.show({ message, type: 'info', duration, icon: 'ℹ️' });
    }

    private async processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const { config, resolve } = this.queue.shift()!;
        await this.displayToast(config);
        resolve();

        // Process next in queue
        this.processQueue();
    }

    private async displayToast(config: ToastConfig): Promise<void> {
        if (!this.scene) {
            console.warn('Toast not initialized with scene');
            return;
        }

        const duration = config.duration || 3000;
        const type = config.type || 'info';

        // Create container
        this.container = this.scene.add.container(GAME_WIDTH / 2, -100);

        // Get color based on type
        const bgColor = this.getBackgroundColor(type);
        const textColor = '#FFFFFF';

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(bgColor, 0.95);
        bg.fillRoundedRect(-150, -25, 300, 50, 25);

        // Shadow
        bg.fillStyle(0x000000, 0.15);
        bg.fillRoundedRect(-150, -23, 300, 50, 25);

        this.container.add(bg);

        // Icon (if provided)
        let textX = 0;
        if (config.icon) {
            const icon = this.scene.add.text(-130, 0, config.icon, {
                fontSize: '24px'
            }).setOrigin(0, 0.5);
            this.container.add(icon);
            textX = 20;
        }

        // Message text
        const text = this.scene.add.text(textX, 0, config.message, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: textColor,
            fontStyle: 'bold',
            wordWrap: { width: 240 }
        }).setOrigin(0.5);
        this.container.add(text);

        // Set depth to be on top of everything
        this.container.setDepth(10000);

        // Slide in animation
        await new Promise<void>((resolve) => {
            this.scene.tweens.add({
                targets: this.container,
                y: 60,
                duration: 400,
                ease: 'Back.easeOut',
                onComplete: () => resolve()
            });
        });

        // Wait for duration
        await new Promise((resolve) => setTimeout(resolve, duration));

        // Slide out animation
        await new Promise<void>((resolve) => {
            this.scene.tweens.add({
                targets: this.container,
                y: -100,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container?.destroy();
                    this.container = undefined;
                    resolve();
                }
            });
        });
    }

    private getBackgroundColor(type: ToastType): number {
        switch (type) {
            case 'success':
                return this.colors.SUCCESS;
            case 'error':
                return this.colors.ERROR;
            case 'warning':
                return this.colors.WARNING;
            case 'info':
                return this.colors.INFO;
            default:
                return this.colors.INFO;
        }
    }
}

// Global helper function
export function showToast(scene: Phaser.Scene, message: string, type?: ToastType) {
    const toast = Toast.getInstance();
    if (!toast['scene']) {
        toast.init(scene);
    }
    return toast.show({ message, type });
}
