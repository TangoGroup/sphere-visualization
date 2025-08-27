declare module 'd3-ease' {
  export type EaseFunction = (t: number) => number;

  export interface EasePolyFactory extends EaseFunction {
    exponent: (exp: number) => EaseFunction;
  }

  export const easeLinear: EaseFunction;

  export const easePolyIn: EasePolyFactory;
  export const easePolyOut: EasePolyFactory;
  export const easePolyInOut: EasePolyFactory;

  export const easeSinIn: EaseFunction;
  export const easeSinOut: EaseFunction;
  export const easeSinInOut: EaseFunction;

  export const easeExpIn: EaseFunction;
  export const easeExpOut: EaseFunction;
  export const easeExpInOut: EaseFunction;

  export const easeBackIn: EaseFunction;
  export const easeBackOut: EaseFunction;
  export const easeBackInOut: EaseFunction;

  export const easeElasticIn: EaseFunction;
  export const easeElasticOut: EaseFunction;
  export const easeElasticInOut: EaseFunction;

  export const easeBounceIn: EaseFunction;
  export const easeBounceOut: EaseFunction;
  export const easeBounceInOut: EaseFunction;
}


