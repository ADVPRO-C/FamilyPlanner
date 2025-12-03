export function parseQuantity(quantity: string): { value: number; unit: string } {
  const trimmed = quantity.trim()
  const match = trimmed.match(/^([\d.,]+)\s*(.*)$/)

  if (!match) {
    return { value: 1, unit: trimmed || 'pz' }
  }

  const valueStr = match[1].replace(',', '.')
  const value = parseFloat(valueStr)
  const unit = match[2].trim()

  return {
    value: isNaN(value) ? 1 : value,
    unit: unit || 'pz',
  }
}

export function formatQuantity(value: number, unit: string): string {
  // Remove trailing zeros if it's an integer-like float
  const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '')
  return unit ? `${formattedValue} ${unit}` : formattedValue
}
