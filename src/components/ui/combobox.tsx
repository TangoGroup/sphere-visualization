import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'

export type ComboboxOption = {
  value: string
  label: string
  group?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select...'
}: {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const grouped = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>()
    for (const opt of options) {
      const key = opt.group || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.label.localeCompare(b.label))
    return Array.from(map.entries())
  }, [options])

  const filtered = React.useMemo(() => {
    if (!query) return grouped
    const q = query.toLowerCase()
    return grouped
      .map(([g, arr]) => [g, arr.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))] as const)
      .filter(([, arr]) => arr.length > 0)
  }, [grouped, query])

  const selected = options.find(o => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between w-full">
          <span className="truncate max-w-[12rem] text-left">{selected ? selected.label : placeholder}</span>
          <span className="text-xs text-gray-500">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="max-h-64 overflow-auto space-y-3">
            {filtered.map(([group, arr]) => (
              <div key={group}>
                <div className="text-xs text-gray-400 mb-1">{group}</div>
                <div className="grid gap-1">
                  {arr.map(opt => (
                    <button
                      key={opt.value}
                      className={`text-sm text-left px-2 py-1 rounded hover:bg-accent ${opt.value === value ? 'bg-accent' : ''}`}
                      onClick={() => { onChange(opt.value); setOpen(false) }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-gray-500">No results</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


