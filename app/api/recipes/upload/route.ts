import { NextResponse } from 'next/server'
// @ts-expect-error - pdf-parse types are missing or incompatible
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.type === 'application/pdf') {
      const data = await pdf(buffer)
      text = data.text
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 })
    }

    // Simple heuristic extraction
    // Assume Title is first line
    // Ingredients follow "Ingredienti" or "Ingredients"
    // Preparation follows "Preparazione" or "Instructions"
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const title = lines[0] || 'Nuova Ricetta'
    
    let ingredients = ''
    let instructions = ''
    let currentSection = 'unknown'

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const lower = line.toLowerCase()
      
      if (lower.includes('ingredienti') || lower.includes('ingredients')) {
        currentSection = 'ingredients'
        continue
      } else if (lower.includes('preparazione') || lower.includes('instructions') || lower.includes('procedimento')) {
        currentSection = 'instructions'
        continue
      }

      if (currentSection === 'ingredients') {
        ingredients += line + '\n'
      } else if (currentSection === 'instructions') {
        instructions += line + '\n'
      }
    }

    // Fallback if no sections found
    if (!ingredients && !instructions) {
      instructions = text
    }

    return NextResponse.json({
      success: true,
      data: {
        name: title,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        category: 'Altro'
      }
    })

  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ success: false, error: 'Failed to parse file' }, { status: 500 })
  }
}
