export type AnimEase =
  | 'linear'
  | 'power1.in' | 'power1.out' | 'power1.inOut'
  | 'power2.in' | 'power2.out' | 'power2.inOut'
  | 'power3.in' | 'power3.out' | 'power3.inOut'
  | 'power4.in' | 'power4.out' | 'power4.inOut'
  | 'sine.in' | 'sine.out' | 'sine.inOut'
  | 'expo.in' | 'expo.out' | 'expo.inOut'
  | 'back.in' | 'back.out' | 'back.inOut'
  | 'elastic.in' | 'elastic.out' | 'elastic.inOut'
  | 'bounce.in' | 'bounce.out' | 'bounce.inOut';

export function getEaser(name: AnimEase | undefined): (t: number) => number {
  switch (name) {
    case 'linear':
      return (t: number) => t;
    case 'power1.in':
      return (t: number) => t * t;
    case 'power1.out':
      return (t: number) => 1 - Math.pow(1 - t, 2);
    case 'power1.inOut':
      return (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    case 'power2.in':
      return (t: number) => t * t * t;
    case 'power2.out':
      return (t: number) => 1 - Math.pow(1 - t, 3);
    case 'power2.inOut':
      return (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    case 'power3.in':
      return (t: number) => t * t * t * t;
    case 'power3.out':
      return (t: number) => 1 - Math.pow(1 - t, 4);
    case 'power3.inOut':
      return (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
    case 'power4.in':
      return (t: number) => t * t * t * t * t;
    case 'power4.out':
      return (t: number) => 1 - Math.pow(1 - t, 5);
    case 'power4.inOut':
      return (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
    case 'sine.in':
      return (t: number) => 1 - Math.cos((t * Math.PI) / 2);
    case 'sine.out':
      return (t: number) => Math.sin((t * Math.PI) / 2);
    case 'sine.inOut':
      return (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    case 'expo.in':
      return (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1)));
    case 'expo.out':
      return (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    case 'expo.inOut':
      return (t: number) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
      };
    case 'back.in':
      return (t: number) => 2.7 * t * t * t - 1.7 * t * t;
    case 'back.out':
      return (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
    case 'back.inOut':
      return (t: number) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
          ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
          : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
      };
    case 'elastic.in':
      return (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
      };
    case 'elastic.out':
      return (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      };
    case 'elastic.inOut':
      return (t: number) => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
      };
    case 'bounce.in':
      return (t: number) => 1 - getEaser('bounce.out')(1 - t);
    case 'bounce.out':
      return (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      };
    case 'bounce.inOut':
      return (t: number) => t < 0.5
        ? (1 - getEaser('bounce.out')(1 - 2 * t)) / 2
        : (1 + getEaser('bounce.out')(2 * t - 1)) / 2;
    default:
      return (t: number) => t;
  }
}


