type AudioGraph = {
  context: AudioContext;
  masterGain: GainNode;
};

export class AudioController {
  private graph: AudioGraph | null = null;
  private backgroundOscillator: OscillatorNode | null = null;
  private muted = false;

  public get isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);

    return this.muted;
  }

  public setMuted(isMuted: boolean): void {
    this.muted = isMuted;
    this.applyMute();
  }

  public async startBackgroundLoop(): Promise<void> {
    const graph = this.getGraph();

    await graph.context.resume();

    if (this.backgroundOscillator !== null) {
      return;
    }

    const oscillator = graph.context.createOscillator();
    const gain = graph.context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = 118;
    gain.gain.value = 0.014;
    oscillator.connect(gain).connect(graph.masterGain);
    oscillator.start();

    this.backgroundOscillator = oscillator;
  }

  public async playWin(): Promise<void> {
    const graph = this.getGraph();
    const notes = [523.25, 659.25, 783.99] as const;
    const startTime = graph.context.currentTime;

    await graph.context.resume();

    notes.forEach((frequency, index) => {
      const oscillator = graph.context.createOscillator();
      const gain = graph.context.createGain();
      const noteStart = startTime + index * 0.09;
      const noteEnd = noteStart + 0.24;

      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.055, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);
      oscillator.connect(gain).connect(graph.masterGain);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });
  }

  private getGraph(): AudioGraph {
    if (this.graph === null) {
      const context = new AudioContext();
      const masterGain = context.createGain();

      masterGain.connect(context.destination);
      this.graph = {
        context,
        masterGain
      };
      this.applyMute();
    }

    return this.graph;
  }

  private applyMute(): void {
    if (this.graph === null) {
      return;
    }

    this.graph.masterGain.gain.value = this.muted ? 0 : 1;
  }
}
