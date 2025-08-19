import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Configuration schema versions
interface ConfigV1 {
  version: 1;
  // Global controls
  vertexCount: number;
  pointSize: number;
  shellCount: number;
  volume: number;
  
  // Effect toggles
  enableSpin: boolean;
  enablePulse: boolean;
  
  // Effect parameters
  spinSpeed: number;
  pulseSpeed: number;
  pulseSize: number;
  
  // Debug controls
  freezeTime: boolean;
  advanceCount: number;
  useAnalytic: boolean;
}

type ConfigV2 = Omit<ConfigV1, 'version'> & {
  version: 2;
  // Added spin axis controls
  spinAxisX: number;
  spinAxisY: number;
}

type ConfigV3 = Omit<ConfigV2, 'version'> & {
  version: 3;
  // Screen-space circular gradient mask controls
  maskEnabled: boolean;
  maskRadius: number; // 0..1 relative to half min(screenW, screenH)
  maskFeather: number; // 0..1 relative to half min(screenW, screenH)
  maskInvert: boolean;
}

type ConfigV4 = Omit<ConfigV3, 'version' | 'useAnalytic'> & {
  version: 4;
  // Noise selection and sine-specific params
  noiseType: 'randomish' | 'sine';
  sineSpeed: number;
  sineScale: number;
}

type ConfigV5 = Omit<ConfigV4, 'version' | 'noiseType'> & {
  version: 5;
  // Composable noise controls
  enableRandomishNoise: boolean;
  randomishAmount: number; // 0..1 weight
  enableSineNoise: boolean;
  sineAmount: number; // 0..1 weight
}

type ConfigV6 = Omit<ConfigV5, 'version' | 'enablePulse' | 'pulseSpeed'> & {
  version: 6;
  // Per-noise speeds
  randomishSpeed: number;
}

type ConfigV7 = Omit<ConfigV6, 'version'> & {
  version: 7;
  // Appearance
  pointColor: string; // hex color, e.g. '#ffffff'
}

type ConfigV8 = Omit<ConfigV7, 'version'> & {
  version: 8;
  // Microphone gain applied to input volume
  micVolume: number; // 1..5
}

type ConfigV9 = Omit<ConfigV8, 'version'> & {
  version: 9;
  micEnabled: boolean;
}

type ConfigV10 = Omit<ConfigV9, 'version'> & {
  version: 10;
  // Output EMA smoothing for mic volume (0..0.98)
  micSmoothing: number;
}

type ConfigV11 = Omit<ConfigV10, 'version'> & {
  version: 11;
  // Ripple noise (surface XY)
  enableRippleNoise: boolean;
  rippleAmount: number; // 0..1
  rippleSpeed: number; // 0.1..10
  rippleScale: number; // 0.1..10
}

type ConfigV12 = Omit<ConfigV11, 'version'> & {
  version: 12;
  // Surface ripple (tangent displacement)
  enableSurfaceRipple: boolean;
  surfaceRippleAmount: number; // 0..1
  surfaceRippleSpeed: number; // 0.1..10
  surfaceRippleScale: number; // 0.1..10
}

type ConfigV13 = Omit<ConfigV12, 'version'> & {
  version: 13;
  // Arc ejections (great-circle segments)
  enableArcs: boolean;
  arcMaxCount: number; // 0..8
  arcSpawnRate: number; // arcs per second
  arcDuration: number; // seconds
  arcSpeed: number; // radians per second
  arcSpanDeg: number; // degrees of visible arc segment
  arcThickness: number; // 0..0.25 (plane distance threshold)
  arcFeather: number; // 0..0.25 (soften edges)
  arcBrightness: number; // 0..3 multiplier for alpha/color
}

type ConfigV14 = Omit<ConfigV13, 'version'> & {
  version: 14;
  arcAltitude: number; // 0..0.2 radial puff amount
}

type ConfigV15 = Omit<ConfigV14, 'version'> & {
  version: 15;
  // Background theme for canvas
  backgroundTheme: 'dark' | 'light';
}

type ConfigV16 = Omit<ConfigV15, 'version'> & {
  version: 16;
  // Global transform and presentation
  size: number; // overall scene scale multiplier
  opacity: number; // 0..1 global alpha multiplier
  rotationX: number; // degrees
  rotationY: number; // degrees
  rotationZ: number; // degrees
}

// Current configuration interface
export interface Config extends ConfigV16 {
  version: 16;
}

// Default configuration
const defaultConfig: Config = {
  version: 16,
  // Global controls
  vertexCount: 400,
  pointSize: 0.04,
  shellCount: 1,
  volume: 0,
  // Global transform
  size: 1,
  opacity: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  
  // Effect toggles
  enableSpin: false,
  // time pulse removed
  
  // Effect parameters
  spinSpeed: 0.35,
  pulseSize: 1.0,
  spinAxisX: 0,
  spinAxisY: 0,
  
  // Mask controls
  maskEnabled: false,
  maskRadius: 0.5,
  maskFeather: 0.2,
  maskInvert: false,
  
  // Noise controls (composable)
  enableRandomishNoise: true,
  randomishAmount: 1.0,
  enableSineNoise: false,
  sineAmount: 0.0,
  randomishSpeed: 1.8,
  sineSpeed: 1.7,
  sineScale: 1.0,
  
  // Appearance
  pointColor: '#ffffff',
  backgroundTheme: 'dark',
  
  // Microphone
  micVolume: 1.0,
  micEnabled: false,
  micSmoothing: 0.8,
  
  // Ripple noise (surface XY)
  enableRippleNoise: false,
  rippleAmount: 0.0,
  rippleSpeed: 1.5,
  rippleScale: 3.0,
  
  // Surface ripple
  enableSurfaceRipple: false,
  surfaceRippleAmount: 0.0,
  surfaceRippleSpeed: 1.5,
  surfaceRippleScale: 3.0,

  // Arcs (disabled by default)
  enableArcs: false,
  arcMaxCount: 4,
  arcSpawnRate: 0.25,
  arcDuration: 4.0,
  arcSpeed: 1.5,
  arcSpanDeg: 60,
  arcThickness: 0.06,
  arcFeather: 0.04,
  arcBrightness: 1.0,
  arcAltitude: 0.02,

  // Debug controls
  freezeTime: false,
  advanceCount: 0,
};

// Migration functions
function migrateV1ToV2(config: ConfigV1): ConfigV2 {
  return {
    ...config,
    version: 2,
    spinAxisX: 0, // Default to no rotation
    spinAxisY: 0,
  };
}

function migrateConfig(config: any): ConfigV14 | ConfigV15 | ConfigV16 {
  if (!config || typeof config !== 'object') {
    return defaultConfig;
  }

  const version = config.version || 1;

  switch (version) {
    case 1:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(
                    migrateV6ToV7(
                      migrateV5ToV6(
                        migrateV4ToV5(
                          migrateV3ToV4(
                            migrateV2ToV3(migrateV1ToV2(config as ConfigV1))
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      );
    case 2:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(
                    migrateV6ToV7(
                      migrateV5ToV6(
                        migrateV4ToV5(
                          migrateV3ToV4(migrateV2ToV3(config as ConfigV2))
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      );
    case 3:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(
                    migrateV6ToV7(
                      migrateV5ToV6(
                        migrateV4ToV5(migrateV3ToV4(config as ConfigV3))
                      )
                    )
                  )
                )
              )
            )
          )
        )
      );
    case 4:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(
                    migrateV6ToV7(
                      migrateV5ToV6(migrateV4ToV5(config as ConfigV4))
                    )
                  )
                )
              )
            )
          )
        )
      );
    case 5:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(
                    migrateV6ToV7(migrateV5ToV6(config as ConfigV5))
                  )
                )
              )
            )
          )
        )
      );
    case 6:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(
                  migrateV7ToV8(migrateV6ToV7(config as ConfigV6))
                )
              )
            )
          )
        )
      );
    case 7:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(
                migrateV8ToV9(migrateV7ToV8(config as ConfigV7))
              )
            )
          )
        )
      );
    case 8:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(migrateV8ToV9(config as ConfigV8))
            )
          )
        )
      );
    case 9:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(
              migrateV9ToV10(config as ConfigV9)
            )
          )
        )
      );
    case 10:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(
            migrateV10ToV11(config as ConfigV10)
          )
        )
      );
    case 11:
      return migrateV13ToV14(
        migrateV12ToV13(
          migrateV11ToV12(config as ConfigV11)
        )
      );
    case 12:
      return migrateV13ToV14(
        migrateV12ToV13(config as ConfigV12)
      );
    case 13:
      return migrateV13ToV14(config as ConfigV13);
    case 14:
      return config as ConfigV14;
    case 15:
      return migrateV15ToV16(config as ConfigV15);
    case 16:
      return config as ConfigV16;
    default:
      console.warn(`Unknown config version ${version}, using defaults`);
      return defaultConfig;
  }
}

function migrateV2ToV3(config: ConfigV2): ConfigV3 {
  return {
    ...config,
    version: 3,
    maskEnabled: false,
    maskRadius: 0.5,
    maskFeather: 0.2,
    maskInvert: false,
  };
}

function migrateV3ToV4(config: ConfigV3): ConfigV4 {
  return {
    ...config,
    version: 4,
    noiseType: 'randomish',
    sineSpeed: 1.7,
    sineScale: 1.0,
  };
}

function migrateV4ToV5(config: ConfigV4): ConfigV5 {
  const isSine = config.noiseType === 'sine';
  return {
    ...config,
    version: 5,
    enableRandomishNoise: !isSine,
    randomishAmount: isSine ? 0.0 : 1.0,
    enableSineNoise: isSine,
    sineAmount: isSine ? 1.0 : 0.0,
    // carry sineSpeed and sineScale through unchanged
  } as unknown as ConfigV5;
}

function migrateV5ToV6(config: ConfigV5): ConfigV6 {
  // Map old global pulseSpeed to randomishSpeed and drop enablePulse/pulseSpeed
  const carriedPulseSpeed = (config as any).pulseSpeed;
  return {
    ...config,
    version: 6,
    randomishSpeed: typeof carriedPulseSpeed === 'number' ? carriedPulseSpeed : 1.8,
  } as unknown as ConfigV6;
}

function migrateV6ToV7(config: ConfigV6): ConfigV7 {
  return {
    ...config,
    version: 7,
    pointColor: '#ffffff',
  } as unknown as ConfigV7;
}

function migrateV7ToV8(config: ConfigV7): ConfigV8 {
  return {
    ...config,
    version: 8,
    micVolume: 1.0,
  } as unknown as ConfigV8;
}

function migrateV8ToV9(config: ConfigV8): ConfigV9 {
  return {
    ...config,
    version: 9,
    micEnabled: false,
  } as unknown as ConfigV9;
}

function migrateV9ToV10(config: ConfigV9): ConfigV10 {
  return {
    ...config,
    version: 10,
    micSmoothing: 0.8,
  } as unknown as ConfigV10;
}

function migrateV10ToV11(config: ConfigV10): ConfigV11 {
  return {
    ...config,
    version: 11,
    enableRippleNoise: false,
    rippleAmount: 0.0,
    rippleSpeed: 1.5,
    rippleScale: 3.0,
  } as unknown as ConfigV11;
}

function migrateV11ToV12(config: ConfigV11): ConfigV12 {
  return {
    ...config,
    version: 12,
    enableSurfaceRipple: false,
    surfaceRippleAmount: 0.0,
    surfaceRippleSpeed: 1.5,
    surfaceRippleScale: 3.0,
  } as unknown as ConfigV12;
}

function migrateV12ToV13(config: ConfigV12): ConfigV13 {
  return {
    ...config,
    version: 13,
    enableArcs: false,
    arcMaxCount: 4,
    arcSpawnRate: 0.25,
    arcDuration: 4.0,
    arcSpeed: 1.5,
    arcSpanDeg: 60,
    arcThickness: 0.06,
    arcFeather: 0.04,
    arcBrightness: 1.0,
  } as unknown as ConfigV13;
}

function migrateV13ToV14(config: ConfigV13): ConfigV14 {
  return {
    ...config,
    version: 14,
    arcAltitude: 0.02,
  } as unknown as ConfigV14;
}

function migrateV14ToV15(config: ConfigV14): ConfigV15 {
  return {
    ...config,
    version: 15,
    backgroundTheme: 'dark',
  } as unknown as ConfigV15;
}

function migrateV15ToV16(config: ConfigV15): ConfigV16 {
  return {
    ...config,
    version: 16,
    size: 1,
    opacity: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  } as unknown as ConfigV16;
}

function migrateToLatest(config: any): Config {
  const migrated = migrateConfig(config);
  if (!migrated || typeof migrated !== 'object') {
    return defaultConfig;
  }
  if ((migrated as ConfigV14).version === 14) {
    const v15 = migrateV14ToV15(migrated as ConfigV14);
    return migrateV15ToV16(v15) as Config;
  }
  if ((migrated as ConfigV15).version === 15) {
    return migrateV15ToV16(migrated as ConfigV15) as Config;
  }
  if ((migrated as ConfigV16).version === 16) {
    return migrated as Config;
  }
  // Fallback safety
  return defaultConfig;
}

// Zustand store
export const useConfigStore = create<{
  config: Config;
  setConfig: (config: Partial<Config>) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (configString: string) => boolean;
}>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      
      setConfig: (updates: Partial<Config>) => {
        set((state) => ({
          config: { ...state.config, ...updates }
        }));
      },
      
      resetConfig: () => {
        set({ config: defaultConfig });
      },
      
      exportConfig: () => {
        const config = get().config;
        return JSON.stringify(config, null, 2);
      },
      
      importConfig: (configString: string) => {
        try {
          const parsed = JSON.parse(configString);
          const migrated = migrateToLatest(parsed);
          set({ config: migrated });
          return true;
        } catch (error) {
          console.error('Failed to import config:', error);
          return false;
        }
      },
    }),
    {
      name: 'sphere-waveform-config',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate any stored config on rehydration
          state.config = migrateToLatest(state.config);
        }
      },
    }
  )
);
