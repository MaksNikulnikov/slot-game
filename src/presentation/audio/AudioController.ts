type AudioGraph = {
  context: AudioContext;
  masterGain: GainNode;
};

export type AudioAssetPaths = {
  backgroundLoopPath: string;
  clickSoundPath: string;
  winSoundPath: string;
};

export type AudioControllerOptions = {
  assets: AudioAssetPaths;
  baseUrl: string;
};

export type AudioProgressHandler = (progress: number) => void;

type LoadedAudioBuffers = {
  backgroundLoop: AudioBuffer;
  click: AudioBuffer;
  win: AudioBuffer;
};

export class AudioController {
  private graph: AudioGraph | null = null;
  private buffers: LoadedAudioBuffers | null = null;
  private backgroundSource: AudioBufferSourceNode | null = null;
  private muted = false;
  private loadingPromise: Promise<LoadedAudioBuffers> | null = null;

  public constructor(private readonly options: AudioControllerOptions) {}

  public get isMuted(): boolean {
    return this.muted;
  }

  public async load(onProgress: AudioProgressHandler): Promise<void> {
    await this.loadBuffers(onProgress);
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

    const buffers = await this.loadBuffers();

    if (this.backgroundSource !== null) {
      return;
    }

    const source = graph.context.createBufferSource();
    const gain = graph.context.createGain();

    source.buffer = buffers.backgroundLoop;
    source.loop = true;
    gain.gain.value = 0.32;
    source.connect(gain).connect(graph.masterGain);
    source.start();
    source.addEventListener("ended", () => {
      if (this.backgroundSource === source) {
        this.backgroundSource = null;
      }
    });

    this.backgroundSource = source;
  }

  public async playClick(): Promise<void> {
    await this.playOneShot("click", 0.62);
  }

  public async playWin(): Promise<void> {
    await this.playOneShot("win", 0.78);
  }

  private async playOneShot(
    bufferName: "click" | "win",
    volume: number
  ): Promise<void> {
    const graph = this.getGraph();

    await graph.context.resume();

    const buffers = await this.loadBuffers();
    const source = graph.context.createBufferSource();
    const gain = graph.context.createGain();

    source.buffer = buffers[bufferName];
    gain.gain.value = volume;
    source.connect(gain).connect(graph.masterGain);
    source.start();
  }

  private async loadBuffers(
    onProgress: AudioProgressHandler = () => {}
  ): Promise<LoadedAudioBuffers> {
    if (this.buffers !== null) {
      onProgress(1);
      return this.buffers;
    }

    if (this.loadingPromise !== null) {
      const buffers = await this.loadingPromise;
      onProgress(1);
      return buffers;
    }

    const graph = this.getGraph();
    const progressByAsset = {
      backgroundLoop: 0,
      click: 0,
      win: 0
    };
    const updateProgress = (): void => {
      const loaded =
        progressByAsset.backgroundLoop +
        progressByAsset.click +
        progressByAsset.win;

      onProgress(loaded / 3);
    };

    this.loadingPromise = Promise.all([
      this.loadBuffer(
        graph.context,
        this.options.assets.backgroundLoopPath,
        (progress) => {
          progressByAsset.backgroundLoop = progress;
          updateProgress();
        }
      ),
      this.loadBuffer(
        graph.context,
        this.options.assets.clickSoundPath,
        (progress) => {
          progressByAsset.click = progress;
          updateProgress();
        }
      ),
      this.loadBuffer(
        graph.context,
        this.options.assets.winSoundPath,
        (progress) => {
          progressByAsset.win = progress;
          updateProgress();
        }
      )
    ]).then(([backgroundLoop, click, win]) => ({
      backgroundLoop,
      click,
      win
    }));

    this.buffers = await this.loadingPromise;
    this.loadingPromise = null;
    onProgress(1);

    return this.buffers;
  }

  private async loadBuffer(
    context: AudioContext,
    path: string,
    onProgress: AudioProgressHandler
  ): Promise<AudioBuffer> {
    const response = await fetch(this.resolvePath(path));

    if (!response.ok) {
      throw new Error(`Cannot load audio asset "${path}"`);
    }

    const bytes = await response.arrayBuffer();
    const buffer = await context.decodeAudioData(bytes);

    onProgress(1);

    return buffer;
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

  private resolvePath(path: string): string {
    return `${this.options.baseUrl}${path}`;
  }

  private applyMute(): void {
    if (this.graph === null) {
      return;
    }

    this.graph.masterGain.gain.value = this.muted ? 0 : 1;
  }
}
