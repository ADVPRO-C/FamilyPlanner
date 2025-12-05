'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  className?: string
  placeholder?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  className,
  placeholder = '0',
}: NumberStepperProps) {
  const numValue = parseFloat(value) || 0
  const isAtMin = numValue <= min
  const isAtMax = numValue >= max

  const handleIncrement = () => {
    const newValue = Math.min(numValue + step, max)
    onChange(newValue.toString())
  }

  const handleDecrement = () => {
    const newValue = Math.max(numValue - step, min)
    onChange(newValue.toString())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string for user to clear
    if (inputValue === '') {
      onChange('')
      return
    }

    // Parse and validate
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max)
      onChange(clamped.toString())
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pulsante decremento - usa div+button nativo per evitare problemi di transizione */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-input bg-background',
          isAtMin 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-accent hover:text-accent-foreground'
        )}
        aria-label="Decrementa"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      {/* Input numerico */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-center text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      
      {/* Pulsante incremento */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-input bg-background',
          isAtMax 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-accent hover:text-accent-foreground'
        )}
        aria-label="Incrementa"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
