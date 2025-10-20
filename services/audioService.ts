class AudioService {
    private audioContext: AudioContext | null = null;

    private initializeAudioContext() {
        // Lazily create AudioContext on first user interaction to comply with browser policies.
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private playSound(
        type: OscillatorType, 
        frequency: number, 
        duration: number, 
        volume: number = 0.3,
        startTimeOffset: number = 0
    ) {
        this.initializeAudioContext();
        if (!this.audioContext) return;

        // FIX: Resume context if suspended and handle potential errors to prevent uncaught promise rejections.
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => console.error("AudioContext resume failed:", err));
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const startTime = this.audioContext.currentTime + startTimeOffset;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    public playJoinSound() {
        // A pleasant, ascending two-tone sound
        this.playSound('sine', 440, 0.15, 0.3, 0);
        this.playSound('sine', 660, 0.15, 0.3, 0.1);
    }
    
    public playLeaveSound() {
        // A descending two-tone sound
        this.playSound('sine', 660, 0.15, 0.3, 0);
        this.playSound('sine', 440, 0.15, 0.3, 0.1);
    }

    public playScreenShareStartSound() {
        this.playSound('triangle', 880, 0.25, 0.2);
    }

    public playScreenShareStopSound() {
        this.playSound('triangle', 770, 0.25, 0.2);
    }

    public playMuteSound() {
        this.playSound('square', 200, 0.1, 0.15);
    }
    
    public playUnmuteSound() {
        this.playSound('square', 250, 0.1, 0.15);
    }
}

// Export a singleton instance
const audioService = new AudioService();
export default audioService;