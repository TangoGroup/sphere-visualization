interface ConfigV1 {
    version: 1;
    vertexCount: number;
    pointSize: number;
    shellCount: number;
    volume: number;
    enableSpin: boolean;
    enablePulse: boolean;
    spinSpeed: number;
    pulseSpeed: number;
    pulseSize: number;
    freezeTime: boolean;
    advanceCount: number;
    useAnalytic: boolean;
}
type ConfigV2 = Omit<ConfigV1, 'version'> & {
    version: 2;
    spinAxisX: number;
    spinAxisY: number;
};
type ConfigV3 = Omit<ConfigV2, 'version'> & {
    version: 3;
    maskEnabled: boolean;
    maskRadius: number;
    maskFeather: number;
    maskInvert: boolean;
};
type ConfigV4 = Omit<ConfigV3, 'version' | 'useAnalytic'> & {
    version: 4;
    noiseType: 'randomish' | 'sine';
    sineSpeed: number;
    sineScale: number;
};
type ConfigV5 = Omit<ConfigV4, 'version' | 'noiseType'> & {
    version: 5;
    enableRandomishNoise: boolean;
    randomishAmount: number;
    enableSineNoise: boolean;
    sineAmount: number;
};
type ConfigV6 = Omit<ConfigV5, 'version' | 'enablePulse' | 'pulseSpeed'> & {
    version: 6;
    randomishSpeed: number;
};
type ConfigV7 = Omit<ConfigV6, 'version'> & {
    version: 7;
    pointColor: string;
};
type ConfigV8 = Omit<ConfigV7, 'version'> & {
    version: 8;
    micVolume: number;
};
type ConfigV9 = Omit<ConfigV8, 'version'> & {
    version: 9;
    micEnabled: boolean;
};
type ConfigV10 = Omit<ConfigV9, 'version'> & {
    version: 10;
    micSmoothing: number;
};
type ConfigV11 = Omit<ConfigV10, 'version'> & {
    version: 11;
    enableRippleNoise: boolean;
    rippleAmount: number;
    rippleSpeed: number;
    rippleScale: number;
};
type ConfigV12 = Omit<ConfigV11, 'version'> & {
    version: 12;
    enableSurfaceRipple: boolean;
    surfaceRippleAmount: number;
    surfaceRippleSpeed: number;
    surfaceRippleScale: number;
};
type ConfigV13 = Omit<ConfigV12, 'version'> & {
    version: 13;
    enableArcs: boolean;
    arcMaxCount: number;
    arcSpawnRate: number;
    arcDuration: number;
    arcSpeed: number;
    arcSpanDeg: number;
    arcThickness: number;
    arcFeather: number;
    arcBrightness: number;
};
type ConfigV14 = Omit<ConfigV13, 'version'> & {
    version: 14;
    arcAltitude: number;
};
type ConfigV15 = Omit<ConfigV14, 'version'> & {
    version: 15;
    backgroundTheme: 'dark' | 'light';
};
type ConfigV16 = Omit<ConfigV15, 'version'> & {
    version: 16;
    size: number;
    opacity: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
};
type ConfigV17 = Omit<ConfigV16, 'version'> & {
    version: 17;
    sizeRandomness: number;
    glowStrength: number;
    glowColor: string;
};
type ConfigV18 = Omit<ConfigV17, 'version'> & {
    version: 18;
    glowRadiusPx: number;
    glowSoftness: number;
};
type ConfigV19 = Omit<ConfigV18, 'version' | 'glowRadiusPx'> & {
    version: 19;
    glowRadiusFactor: number;
};
type ConfigV20 = Omit<ConfigV19, 'version' | 'glowSoftness'> & {
    version: 20;
};
type ConfigV21 = Omit<ConfigV20, 'version'> & {
    version: 21;
    shellPhaseJitter: number;
};
type ConfigV22 = Omit<ConfigV21, 'version'> & {
    version: 22;
    micAffectsGlobal: boolean;
    randomishMicModAmount: number;
    sineLfoModAmount: number;
    sineLfoModSpeed: number;
};
type ConfigV23 = Omit<ConfigV22, 'version' | 'sineLfoModAmount' | 'sineLfoModSpeed'> & {
    version: 23;
    sineMicModAmount: number;
    rippleMicModAmount: number;
    surfaceRippleMicModAmount: number;
};
type ConfigV24 = Omit<ConfigV23, 'version'> & {
    version: 24;
    enableGradient: boolean;
    gradientColor2: string;
    gradientAngle: number;
};
export interface Config extends ConfigV24 {
    version: 24;
}
export declare const defaultConfig: Config;
export declare const useConfigStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<{
    config: Config;
    setConfig: (config: Partial<Config>) => void;
    resetConfig: () => void;
    exportConfig: () => string;
    importConfig: (configString: string) => boolean;
}>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<{
            config: Config;
            setConfig: (config: Partial<Config>) => void;
            resetConfig: () => void;
            exportConfig: () => string;
            importConfig: (configString: string) => boolean;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: {
            config: Config;
            setConfig: (config: Partial<Config>) => void;
            resetConfig: () => void;
            exportConfig: () => string;
            importConfig: (configString: string) => boolean;
        }) => void) => () => void;
        onFinishHydration: (fn: (state: {
            config: Config;
            setConfig: (config: Partial<Config>) => void;
            resetConfig: () => void;
            exportConfig: () => string;
            importConfig: (configString: string) => boolean;
        }) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<{
            config: Config;
            setConfig: (config: Partial<Config>) => void;
            resetConfig: () => void;
            exportConfig: () => string;
            importConfig: (configString: string) => boolean;
        }, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=configStore.d.ts.map