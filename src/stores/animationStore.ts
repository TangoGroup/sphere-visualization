import { create } from 'zustand';
import type { Config } from './configStore';

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
  // CRUD
  create: (name?: string) => AnimationId;
  remove: (id: AnimationId) => void;
  duplicate: (id: AnimationId) => AnimationId | null;
  setActive: (id: AnimationId | null) => void;
  // Editing lifecycle
  beginEdit: (id: AnimationId) => void;
  discardDraft: () => void;
  saveDraft: () => void;
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

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  animations: [],
  activeId: null,
  editorId: null,
  draft: null,
  playRequestId: null,

  requestPlay: (id) => set({ playRequestId: id }),
  clearPlayRequest: () => set({ playRequestId: null }),

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
    animations: s.animations.filter((a) => a.id !== id),
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
}));


