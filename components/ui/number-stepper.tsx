'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
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
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={numValue <= min}
        className="h-10 w-10 flex-shrink-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="text-center h-10"
        min={min}
        max={max}
        step={step}
      />
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={numValue >= max}
        className="h-10 w-10 flex-shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
