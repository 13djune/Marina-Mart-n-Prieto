// Procedural Web Audio API sound synthesizer for tactile sketchbook interactions
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false; // Muted by default per user request

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Realistic paper flutter / page turn swoosh
  public playPageTurn() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.35; // 350ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered pinkish paper noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to simulate crisp textured paper scraping
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.35);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // AudioContext policy fallback
    }
  }

  // Subtle book cover opening creak / leather slide
  public playBookOpen() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);

      // Followed by soft paper rustle
      setTimeout(() => this.playPageTurn(), 180);
    } catch {
      // Ignore
    }
  }

  // Clasp unbuckle / metallic snap
  public playClasp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
