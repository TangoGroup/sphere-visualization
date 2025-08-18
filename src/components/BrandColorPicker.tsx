import { useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

type ColorToken = { tone: number; hex: string }
type ColorFamily = { name: string; tokens: ColorToken[] }

const COLOR_PALETTE: ColorFamily[] = [
  {
    name: 'Truth Blue',
    tokens: [
      { tone: 50, hex: '#edf5ff' },
      { tone: 100, hex: '#d7e7ff' },
      { tone: 200, hex: '#b9d6ff' },
      { tone: 300, hex: '#88beff' },
      { tone: 400, hex: '#509aff' },
      { tone: 500, hex: '#2871ff' },
      { tone: 600, hex: '#1f59ff' },
      { tone: 700, hex: '#0a39eb' },
      { tone: 800, hex: '#0f2fbe' },
      { tone: 900, hex: '#132e95' },
      { tone: 950, hex: '#111e5a' },
    ],
  },
  {
    name: 'Gloo Gold',
    tokens: [
      { tone: 100, hex: '#FFF0B1' },
      { tone: 300, hex: '#FFDE4B' },
      { tone: 400, hex: '#FFD727' },
      { tone: 500, hex: '#F6C414' },
      { tone: 700, hex: '#CF8A11' },
      { tone: 900, hex: '#90640A' },
    ],
  },
  {
    name: 'Gloo Green',
    tokens: [
      { tone: 50, hex: '#EAFFF4' },
      { tone: 100, hex: '#CDFEE3' },
      { tone: 200, hex: '#A0FACE' },
      { tone: 300, hex: '#63F2B4' },
      { tone: 400, hex: '#25E297' },
      { tone: 500, hex: '#00C980' },
      { tone: 600, hex: '#00A469' },
      { tone: 700, hex: '#008358' },
      { tone: 800, hex: '#006747' },
      { tone: 900, hex: '#00553B' },
      { tone: 950, hex: '#003022' },
    ],
  },
  {
    name: 'Charcoal',
    tokens: [
      { tone: 50, hex: '#FAFAFA' },
      { tone: 100, hex: '#F5F5F5' },
      { tone: 200, hex: '#E5E5E5' },
      { tone: 300, hex: '#D4D4D4' },
      { tone: 400, hex: '#A3A3A3' },
      { tone: 500, hex: '#737373' },
      { tone: 600, hex: '#525252' },
      { tone: 700, hex: '#424142' },
      { tone: 800, hex: '#262626' },
      { tone: 900, hex: '#171717' },
    ],
  },
  {
    name: 'Insightful Purple',
    tokens: [
      { tone: 50, hex: '#F5F3FF' },
      { tone: 100, hex: '#EDE9FE' },
      { tone: 200, hex: '#DDD6FE' },
      { tone: 300, hex: '#C4B5FD' },
      { tone: 400, hex: '#A78BFA' },
      { tone: 500, hex: '#8B5CF6' },
      { tone: 600, hex: '#7C3AED' },
      { tone: 700, hex: '#6D28D9' },
      { tone: 800, hex: '#5B21B6' },
      { tone: 900, hex: '#4C1D95' },
      { tone: 950, hex: '#2a1065' },
    ],
  },
]

export type BrandColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  label?: string
}

export function BrandColorPicker({ value, onChange, label = 'Point Color' }: BrandColorPickerProps) {
  const selected = useMemo(() => value.toLowerCase(), [value])

  const inPalette = useMemo(() => {
    return COLOR_PALETTE.some((f) => f.tokens.some((t) => t.hex.toLowerCase() === selected))
  }, [selected])

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded border border-gray-500" style={{ backgroundColor: value }} />
            <span className="font-mono text-xs">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-3">
          <div className="space-y-3">
            {COLOR_PALETTE.map((family) => {
              return (
                <div key={family.name}>
                  <div className="text-xs text-gray-400 mb-1">{family.name}</div>
                  <div className="grid grid-flow-col auto-cols-max gap-2">
                    {family.tokens.map((t) => {
                      const isSelected = t.hex.toLowerCase() === selected
                      return (
                        <button
                          key={`${family.name}-${t.tone}`}
                          onClick={() => onChange(t.hex)}
                          className={`h-7 w-7 rounded border ${isSelected ? 'ring-2 ring-white border-white' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-white`}
                          aria-label={`${family.name} ${t.tone}`}
                          title={`${family.name} ${t.tone} (${t.hex})`}
                          style={{ backgroundColor: t.hex }}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {!inPalette && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Current color</span>
                <span className="inline-block h-3 w-3 rounded border border-gray-600" style={{ backgroundColor: value }} />
                <span className="font-mono">{value}</span>
                <span>(not in palette)</span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default BrandColorPicker


