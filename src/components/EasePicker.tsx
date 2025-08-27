import { Combobox, type ComboboxOption } from './ui/combobox'
import type { AnimEase } from '@/stores/animationStore'
import {
  easeLinear,
  easePolyIn,
  easePolyOut,
  easePolyInOut,
  easeSinIn,
  easeSinOut,
  easeSinInOut,
  easeExpIn,
  easeExpOut,
  easeExpInOut,
  easeBackIn,
  easeBackOut,
  easeBackInOut,
  easeElasticIn,
  easeElasticOut,
  easeElasticInOut,
  easeBounceIn,
  easeBounceOut,
  easeBounceInOut,
} from 'd3-ease'

const easeOptions: ComboboxOption[] = [
  { value: 'linear', label: 'linear', group: 'Common' },
  { value: 'power1.in', label: 'power1.in', group: 'Power1' },
  { value: 'power1.out', label: 'power1.out', group: 'Power1' },
  { value: 'power1.inOut', label: 'power1.inOut', group: 'Power1' },
  { value: 'power2.in', label: 'power2.in', group: 'Power2' },
  { value: 'power2.out', label: 'power2.out', group: 'Power2' },
  { value: 'power2.inOut', label: 'power2.inOut', group: 'Power2' },
  { value: 'power3.in', label: 'power3.in', group: 'Power3' },
  { value: 'power3.out', label: 'power3.out', group: 'Power3' },
  { value: 'power3.inOut', label: 'power3.inOut', group: 'Power3' },
  { value: 'power4.in', label: 'power4.in', group: 'Power4' },
  { value: 'power4.out', label: 'power4.out', group: 'Power4' },
  { value: 'power4.inOut', label: 'power4.inOut', group: 'Power4' },
  { value: 'sine.in', label: 'sine.in', group: 'Sine' },
  { value: 'sine.out', label: 'sine.out', group: 'Sine' },
  { value: 'sine.inOut', label: 'sine.inOut', group: 'Sine' },
  { value: 'expo.in', label: 'expo.in', group: 'Expo' },
  { value: 'expo.out', label: 'expo.out', group: 'Expo' },
  { value: 'expo.inOut', label: 'expo.inOut', group: 'Expo' },
  { value: 'back.in', label: 'back.in', group: 'Back' },
  { value: 'back.out', label: 'back.out', group: 'Back' },
  { value: 'back.inOut', label: 'back.inOut', group: 'Back' },
  { value: 'elastic.in', label: 'elastic.in', group: 'Elastic' },
  { value: 'elastic.out', label: 'elastic.out', group: 'Elastic' },
  { value: 'elastic.inOut', label: 'elastic.inOut', group: 'Elastic' },
  { value: 'bounce.in', label: 'bounce.in', group: 'Bounce' },
  { value: 'bounce.out', label: 'bounce.out', group: 'Bounce' },
  { value: 'bounce.inOut', label: 'bounce.inOut', group: 'Bounce' },
]

function easeFn(key: string) {
  switch (key) {
    case 'linear': return easeLinear
    case 'power1.in': return (t: number) => easePolyIn.exponent(1)(t)
    case 'power1.out': return (t: number) => easePolyOut.exponent(1)(t)
    case 'power1.inOut': return (t: number) => easePolyInOut.exponent(1)(t)
    case 'power2.in': return (t: number) => easePolyIn.exponent(2)(t)
    case 'power2.out': return (t: number) => easePolyOut.exponent(2)(t)
    case 'power2.inOut': return (t: number) => easePolyInOut.exponent(2)(t)
    case 'power3.in': return (t: number) => easePolyIn.exponent(3)(t)
    case 'power3.out': return (t: number) => easePolyOut.exponent(3)(t)
    case 'power3.inOut': return (t: number) => easePolyInOut.exponent(3)(t)
    case 'power4.in': return (t: number) => easePolyIn.exponent(4)(t)
    case 'power4.out': return (t: number) => easePolyOut.exponent(4)(t)
    case 'power4.inOut': return (t: number) => easePolyInOut.exponent(4)(t)
    case 'sine.in': return easeSinIn
    case 'sine.out': return easeSinOut
    case 'sine.inOut': return easeSinInOut
    case 'expo.in': return easeExpIn
    case 'expo.out': return easeExpOut
    case 'expo.inOut': return easeExpInOut
    case 'back.in': return easeBackIn
    case 'back.out': return easeBackOut
    case 'back.inOut': return easeBackInOut
    case 'elastic.in': return easeElasticIn
    case 'elastic.out': return easeElasticOut
    case 'elastic.inOut': return easeElasticInOut
    case 'bounce.in': return easeBounceIn
    case 'bounce.out': return easeBounceOut
    case 'bounce.inOut': return easeBounceInOut
    default: return easeLinear
  }
}

function renderEasePath(key: string, width = 100, height = 40, samples = 60) {
  const fn = easeFn(key)
  const pts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const x = t * width
    const y = (1 - fn(t)) * height
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

export function EasePicker({ value, onChange }: { value: AnimEase, onChange: (v: AnimEase) => void }) {
  return (
    <Combobox
      value={value}
      onChange={(val) => onChange(val as AnimEase)}
      options={easeOptions}
      placeholder="Select ease"
      renderOption={(opt) => (
        <div className="flex items-center gap-2">
          <span className="min-w-[7.5rem] inline-block truncate">{opt.label}</span>
          <svg width="90" height="28" className="shrink-0">
            <rect x="0" y="0" width="90" height="28" rx="3" ry="3" fill="none" stroke="rgb(75,85,99)" />
            <path d={`${renderEasePath(opt.value, 80, 18, 50)}`}
                  transform="translate(5,5)"
                  fill="none"
                  stroke="rgb(107,114,128)"
                  strokeWidth="1.5" />
          </svg>
        </div>
      )}
    />
  )
}


