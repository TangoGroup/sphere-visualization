import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultConfig, type Config } from './configStore';

export type AnimEase =
  | 'linear'
  | 'power1.inOut'
  | 'power2.inOut'
  | 'power3.inOut'
  | 'sine.inOut'
  | 'expo.inOut';

export type AnimationId = string;

export type AnimationDef = {
  id: AnimationId;
  name: string;
  to: Partial<Config>;
  duration: number; // seconds
  ease: AnimEase;
  system?: boolean;
};

type AnimationStore = {
  animations: AnimationDef[];
  activeId: AnimationId | null; // selected in list
  editorId: AnimationId | null; // currently editing animation id
  draft: AnimationDef | null;   // unsaved edits
  // play dispatch (to be handled by runner later)
  playRequestId: AnimationId | null;
  requestPlay: (id: AnimationId) => void;
  clearPlayRequest: () => void;
  // import/export
  exportAnimations: () => string;
  importAnimations: (json: string) => boolean;
  // CRUD
  create: (name?: string) => AnimationId;
  remove: (id: AnimationId) => void;
  duplicate: (id: AnimationId) => AnimationId | null;
  setActive: (id: AnimationId | null) => void;
  // Editing lifecycle
  beginEdit: (id: AnimationId) => void;
  discardDraft: () => void;
  saveDraft: () => void;
  ensureDefaultAnimation: () => void;
  ensureDefaultAnimation: () => void;
  // Draft edits
  setDraftName: (name: string) => void;
  setDraftDuration: (seconds: number) => void;
  setDraftEase: (ease: AnimEase) => void;
  addOrUpdateDraftProp: <K extends keyof Config>(key: K, value: Config[K]) => void;
  removeDraftProp: (key: keyof Config) => void;
};

function makeId(): AnimationId {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildDefaultsTarget(): Partial<Config> {
  // Only include numeric and color/string we can animate/interpolate directly
  return {
    // global
    size: defaultConfig.size,
    opacity: defaultConfig.opacity,
    rotationX: defaultConfig.rotationX,
    rotationY: defaultConfig.rotationY,
    rotationZ: defaultConfig.rotationZ,
    pointSize: defaultConfig.pointSize,
    vertexCount: defaultConfig.vertexCount,
    pointColor: defaultConfig.pointColor,
    volume: defaultConfig.volume,
    // noise
    randomishAmount: defaultConfig.randomishAmount,
    pulseSize: defaultConfig.pulseSize,
    randomishSpeed: defaultConfig.randomishSpeed,
    sineAmount: defaultConfig.sineAmount,
    sineSpeed: defaultConfig.sineSpeed,
    sineScale: defaultConfig.sineScale,
    rippleAmount: defaultConfig.rippleAmount,
    rippleSpeed: defaultConfig.rippleSpeed,
    rippleScale: defaultConfig.rippleScale,
    surfaceRippleAmount: defaultConfig.surfaceRippleAmount,
    surfaceRippleSpeed: defaultConfig.surfaceRippleSpeed,
    surfaceRippleScale: defaultConfig.surfaceRippleScale,
    // mask
    maskRadius: defaultConfig.maskRadius,
    maskFeather: defaultConfig.maskFeather,
    // spin
    spinSpeed: defaultConfig.spinSpeed,
    spinAxisX: defaultConfig.spinAxisX,
    spinAxisY: defaultConfig.spinAxisY,
    // arcs
    arcMaxCount: defaultConfig.arcMaxCount,
    arcSpawnRate: defaultConfig.arcSpawnRate,
    arcDuration: defaultConfig.arcDuration,
    arcSpeed: defaultConfig.arcSpeed,
    arcSpanDeg: defaultConfig.arcSpanDeg,
    arcThickness: defaultConfig.arcThickness,
    arcFeather: defaultConfig.arcFeather,
    arcBrightness: defaultConfig.arcBrightness,
    arcAltitude: defaultConfig.arcAltitude,
  };
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set, get) => ({
  animations: [],
  ensureDefaultAnimation: () => set((s) => {
    const exists = s.animations.some(a => a.system && a.name === 'Default');
    if (exists) return {} as any;
    const def: AnimationDef = {
      id: 'default-animation',
      name: 'Default',
      system: true,
      duration: 0.6,
      ease: 'power2.inOut',
      to: buildDefaultsTarget(),
    };
    return { animations: [def, ...s.animations] };
  }),
  activeId: null,
  editorId: null,
  draft: null,
  playRequestId: null,
  ensureDefaultAnimation: () => set((s) => {
    const exists = s.animations.some(a => a.system && a.name === 'Default');
    if (exists) return {} as any;
    const def: AnimationDef = {
      id: 'default-animation',
      name: 'Default',
      system: true,
      duration: 0.6,
      ease: 'power2.inOut',
      to: buildDefaultsTarget(),
    };
    return { animations: [def, ...s.animations] };
  }),

  requestPlay: (id) => set({ playRequestId: id }),
  clearPlayRequest: () => set({ playRequestId: null }),

  exportAnimations: () => {
    const { animations } = get();
    try {
      return JSON.stringify(animations, null, 2);
    } catch {
      return '[]';
    }
  },

  importAnimations: (json: string) => {
    try {
      const parsed = JSON.parse(json);
      const list: AnimationDef[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.animations)
          ? parsed.animations
          : [];
      if (!Array.isArray(list)) return false;
      // Basic shape check
      const cleaned: AnimationDef[] = list.map((a: any) => ({
        id: typeof a.id === 'string' ? a.id : makeId(),
        name: typeof a.name === 'string' ? a.name : 'Animation',
        to: typeof a.to === 'object' && a.to ? a.to : {},
        duration: typeof a.duration === 'number' ? a.duration : 1.0,
        ease: typeof a.ease === 'string' ? (a.ease as any) : 'power2.inOut',
        system: Boolean(a.system),
      }));
      const ensureDefault = (arr: AnimationDef[]): AnimationDef[] => {
        const exists = arr.some(a => a.system && a.name === 'Default');
        if (exists) return arr;
        const def: AnimationDef = {
          id: 'default-animation',
          name: 'Default',
          system: true,
          duration: 0.6,
          ease: 'power2.inOut',
          to: buildDefaultsTarget(),
        };
        return [def, ...arr];
      };
      set({ animations: ensureDefault(cleaned), activeId: null, editorId: null, draft: null, playRequestId: null });
      return true;
    } catch (e) {
      console.error('Failed to import animations', e);
      return false;
    }
  },

  create: (name = 'New Animation') => {
    const id = makeId();
    const anim: AnimationDef = {
      id,
      name,
      to: {},
      duration: 1.0,
      ease: 'power2.inOut',
    };
    set((s) => ({ animations: [...s.animations, anim], activeId: id }));
    // Start editing immediately with a fresh draft
    get().beginEdit(id);
    return id;
  },

  remove: (id) => set((s) => ({
    animations: s.animations.filter((a) => a.id !== id && !a.system),
    activeId: s.activeId === id ? null : s.activeId,
    editorId: s.editorId === id ? null : s.editorId,
    draft: s.editorId === id ? null : s.draft,
  })),

  duplicate: (id) => {
    const { animations } = get();
    const src = animations.find((a) => a.id === id);
    if (!src) return null;
    const newId = makeId();
    const copy: AnimationDef = {
      ...src,
      id: newId,
      name: src.name + ' Copy',
      to: { ...src.to },
    };
    set({ animations: [...animations, copy] });
    return newId;
  },

  setActive: (id) => set({ activeId: id }),

  beginEdit: (id) => set((s) => {
    const src = s.animations.find((a) => a.id === id) || null;
    const draft = src ? { ...src, to: { ...src.to } } : null;
    return { editorId: id, draft, activeId: id };
  }),

  discardDraft: () => set({ draft: null, editorId: null }),

  saveDraft: () => set((s) => {
    if (!s.editorId || !s.draft) return {} as any;
    const animations = s.animations.map((a) => (a.id === s.editorId ? { ...s.draft } : a));
    return { animations, draft: null, editorId: null };
  }),

  setDraftName: (name) => set((s) => ({ draft: s.draft ? { ...s.draft, name } : s.draft })),
  setDraftDuration: (seconds) => set((s) => ({ draft: s.draft ? { ...s.draft, duration: Math.max(0, seconds) } : s.draft })),
  setDraftEase: (ease) => set((s) => ({ draft: s.draft ? { ...s.draft, ease } : s.draft })),

  addOrUpdateDraftProp: (key, value) => set((s) => {
    // If no draft, create a new animation and begin edit
    if (!s.draft) {
      const id = get().create();
      const { draft } = get();
      if (!draft) return {} as any;
      return { draft: { ...draft, to: { ...draft.to, [key]: value } } };
    }
    return { draft: { ...s.draft, to: { ...s.draft.to, [key]: value } } };
  }),

  removeDraftProp: (key) => set((s) => {
    if (!s.draft) return {} as any;
    const { [key]: _omitted, ...rest } = s.draft.to as any;
    return { draft: { ...s.draft, to: rest } };
  }),
    }),
    {
      name: 'sphere-waveform-animations',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            const s = useAnimationStore.getState();
            s.ensureDefaultAnimation();
          } catch {}
        }
      }
    }
  )
);


