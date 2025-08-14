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

// Current configuration interface
export interface Config extends ConfigV3 {
  version: 3;
}

// Default configuration
const defaultConfig: Config = {
  version: 3,
  // Global controls
  vertexCount: 400,
  pointSize: 0.04,
  shellCount: 1,
  volume: 0,
  
  // Effect toggles
  enableSpin: false,
  enablePulse: true,
  
  // Effect parameters
  spinSpeed: 0.35,
  pulseSpeed: 1.8,
  pulseSize: 1.0,
  spinAxisX: 0,
  spinAxisY: 0,
  
  // Mask controls
  maskEnabled: false,
  maskRadius: 0.5,
  maskFeather: 0.2,
  maskInvert: false,
  
  // Debug controls
  freezeTime: false,
  advanceCount: 0,
  useAnalytic: false,
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

function migrateConfig(config: any): Config {
  if (!config || typeof config !== 'object') {
    return defaultConfig;
  }

  const version = config.version || 1;

  switch (version) {
    case 1:
      return migrateV2ToV3(migrateV1ToV2(config as ConfigV1));
    case 2:
      return migrateV2ToV3(config as ConfigV2);
    case 3:
      return config as Config;
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
          const migrated = migrateConfig(parsed);
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
          state.config = migrateConfig(state.config);
        }
      },
    }
  )
);
