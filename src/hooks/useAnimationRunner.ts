import { useEffect, useRef } from 'react';
import { useAnimationStore } from '@/stores/animationStore';
import { useConfigStore, type Config } from '@/stores/configStore';
import * as THREE from 'three';

type Easer = (t: number) => number;

function getEaser(name: string): Easer {
  switch (name) {
    case 'linear':
      return (t) => t;
    case 'power1.inOut':
      return (t) => {
        // easeInOutQuad
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      };
    case 'power2.inOut':
      return (t) => {
        // easeInOutCubic
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
    case 'power3.inOut':
      return (t) => {
        // easeInOutQuart
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      };
    case 'sine.inOut':
      return (t) => -(Math.cos(Math.PI * t) - 1) / 2;
    case 'expo.inOut':
      return (t) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2;
      };
    default:
      return (t) => t;
  }
}

export function useAnimationRunner() {
  const requestRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const cancelRef = useRef<() => void>(() => {});
  const { playRequestId, clearPlayRequest, animations } = useAnimationStore();
  const setConfig = useConfigStore((s) => s.setConfig);
  const getConfig = useConfigStore((s) => s.config);

  useEffect(() => {
    if (!playRequestId) return;
    const anim = animations.find((a) => a.id === playRequestId);
    if (!anim) {
      clearPlayRequest();
      return;
    }

    // Cancel any running tween
    if (cancelRef.current) {
      cancelRef.current();
    }

    const startConfig = getConfig;
    const from: Partial<Config> = {};
    const to: Partial<Config> = {};
    const colorPairs: Record<string, { from: THREE.Color; to: THREE.Color }> = {};
    for (const k in anim.to) {
      const key = k as keyof Config;
      const target = anim.to[key];
      const current = (startConfig as any)[key];
      if (typeof target === 'number' && typeof current === 'number') {
        (from as any)[key] = current;
        (to as any)[key] = target;
      } else if ((key === 'pointColor' || key === 'gradientColor2') && typeof target === 'string' && typeof current === 'string') {
        try {
          colorPairs[key] = { from: new THREE.Color(current), to: new THREE.Color(target) };
        } catch {
          // ignore invalid colors
        }
      }
      // Other non-numeric keys are ignored in this runner
    }

    const ease = getEaser(anim.ease);
    const durationMs = Math.max(0, anim.duration) * 1000;
    startRef.current = performance.now();
    let stopped = false;

    const step = () => {
      if (stopped) return;
      const now = performance.now();
      const t = Math.min(1, durationMs === 0 ? 1 : (now - startRef.current) / durationMs);
      const te = ease(t);
      const updates: Partial<Config> = {};
      for (const k in to) {
        const key = k as keyof Config;
        const a = (from as any)[key];
        const b = (to as any)[key];
        (updates as any)[key] = a + (b - a) * te;
      }
      for (const k in colorPairs) {
        const pair = colorPairs[k];
        const c = pair.from.clone().lerp(pair.to, te);
        (updates as any)[k] = `#${c.getHexString()}`;
      }
      setConfig(updates);
      if (t < 1) {
        requestRef.current = requestAnimationFrame(step);
      } else {
        clearPlayRequest();
      }
    };

    requestRef.current = requestAnimationFrame(step);
    cancelRef.current = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      stopped = true;
    };

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playRequestId]);
}


