/**
 * Ses dosyaları için Web Audio API ile basit tonlar oluşturur
 */
class SimpleSoundGenerator {
    private audioContext: AudioContext | null = null;
    private isEnabled: boolean = true; // Ses aktif mi?

    constructor() {
        // Web Audio Context oluştur
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
            this.audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Basit bir beep sesi çalar
     */
    public playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
        // Ses kapalıysa çalma
        if (!this.isEnabled) {
            return;
        }

        if (!this.audioContext) {
            console.warn('AudioContext not available');
            return;
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Fade out için
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.error('Error playing tone:', error);
        }
    }

    /**
     * Sesi aç
     */
    public enable(): void {
        this.isEnabled = true;
    }

    /**
     * Sesi kapat
     */
    public disable(): void {
        this.isEnabled = false;
    }

    /**
     * Ses aktif mi?
     */
    public isSoundEnabled(): boolean {
        return this.isEnabled;
    }


    /**
     * Doğru cevap sesi - yukarı doğru iki ton (pozitif)
     */
    public playCorrectSound(): void {
        this.playTone(523.25, 0.1, 'sine'); // C5
        setTimeout(() => {
            this.playTone(659.25, 0.15, 'sine'); // E5
        }, 80);
    }

    /**
     * Yanlış cevap sesi - aşağı doğru ton (negatif)
     */
    public playWrongSound(): void {
        this.playTone(392, 0.1, 'square'); // G4
        setTimeout(() => {
            this.playTone(311.13, 0.2, 'square'); // D#4
        }, 80);
    }

    /**
     * Buton tıklama sesi
     */
    public playClickSound(): void {
        this.playTone(800, 0.05, 'square');
    }

    /**
     * Başarı sesi (seviye tamamlama)
     */
    public playSuccessSound(): void {
        this.playTone(523.25, 0.1, 'sine'); // C5
        setTimeout(() => {
            this.playTone(659.25, 0.1, 'sine'); // E5
        }, 100);
        setTimeout(() => {
            this.playTone(783.99, 0.2, 'sine'); // G5
        }, 200);
    }

    public playHintSound(): void {
        // Magical sound
        this.playTone(600, 0.1, 'sine');
        setTimeout(() => this.playTone(800, 0.2, 'sine'), 100);
    }
}

// Export singleton
export default new SimpleSoundGenerator();
