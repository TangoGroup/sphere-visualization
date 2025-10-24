import { type Config } from './configStore';
export type AnimEase = 'linear' | 'power1.in' | 'power1.out' | 'power1.inOut' | 'power2.in' | 'power2.out' | 'power2.inOut' | 'power3.in' | 'power3.out' | 'power3.inOut' | 'power4.in' | 'power4.out' | 'power4.inOut' | 'sine.in' | 'sine.out' | 'sine.inOut' | 'expo.in' | 'expo.out' | 'expo.inOut' | 'back.in' | 'back.out' | 'back.inOut' | 'elastic.in' | 'elastic.out' | 'elastic.inOut' | 'bounce.in' | 'bounce.out' | 'bounce.inOut';
export type AnimationId = string;
export type AnimationDef = {
    id: AnimationId;
    name: string;
    to: Partial<Config>;
    duration: number;
    ease: AnimEase;
    system?: boolean;
};
type AnimationStore = {
    animations: AnimationDef[];
    activeId: AnimationId | null;
    editorId: AnimationId | null;
    draft: AnimationDef | null;
    playRequestId: AnimationId | null;
    requestPlay: (id: AnimationId) => void;
    clearPlayRequest: () => void;
    exportAnimations: () => string;
    importAnimations: (json: string) => boolean;
    create: (name?: string) => AnimationId;
    remove: (id: AnimationId) => void;
    duplicate: (id: AnimationId) => AnimationId | null;
    setActive: (id: AnimationId | null) => void;
    beginEdit: (id: AnimationId) => void;
    discardDraft: () => void;
    saveDraft: () => void;
    ensureDefaultAnimation: () => void;
    setDraftName: (name: string) => void;
    setDraftDuration: (seconds: number) => void;
    setDraftEase: (ease: AnimEase) => void;
    replaceDraftTo: (to: Partial<Config>) => void;
    addOrUpdateDraftProp: <K extends keyof Config>(key: K, value: Config[K]) => void;
    removeDraftProp: (key: keyof Config) => void;
};
export declare const useAnimationStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AnimationStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AnimationStore, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AnimationStore) => void) => () => void;
        onFinishHydration: (fn: (state: AnimationStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AnimationStore, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=animationStore.d.ts.map