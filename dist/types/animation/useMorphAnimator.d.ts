import type { SphereWaveformProps } from '../components/SphereWaveform';
import { type AnimEase } from './easing';
export type WaveformConfig = Omit<SphereWaveformProps, 'transition' | 'morph'>;
export type AnimSpec = {
    to: Partial<WaveformConfig>;
    duration: number;
    ease?: AnimEase;
};
export declare function interpolateConfig(from: WaveformConfig, to: Partial<WaveformConfig>, t: number): WaveformConfig;
export declare function useMorphAnimator(opts?: {
    ease?: AnimEase;
    onStart?: () => void;
    onUpdate?: (progress: number) => void;
    onComplete?: (final: WaveformConfig) => void;
}): {
    readonly morph: {
        enabled: boolean;
        progress: number;
        to: Partial<WaveformConfig> | undefined;
    } | {
        enabled: boolean;
        progress: number;
        to?: undefined;
    };
    readonly play: (anim: AnimSpec, from: WaveformConfig) => void;
    readonly cancel: () => void;
    readonly playing: boolean;
    readonly progress: number;
};
export declare class MorphController {
    private easeFn;
    private raf;
    private start;
    private durMs;
    private from;
    private to;
    constructor(ease?: AnimEase);
    cancel(): void;
    play(anim: AnimSpec, from: WaveformConfig, onProgress: (p: number, to: Partial<WaveformConfig>) => void): Promise<WaveformConfig>;
}
//# sourceMappingURL=useMorphAnimator.d.ts.map