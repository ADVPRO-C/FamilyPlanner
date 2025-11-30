'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addRecipe } from '@/app/actions/recipes'
import { toast } from 'sonner'

export function RecipeImporter() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<{ name: string; ingredients: string; instructions: string; category: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/recipes/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()

      if (result.success) {
        setParsedData(result.data)
        toast.success('File parsed successfully')
      } else {
        toast.error('Failed to parse file')
      }
    } catch (error) {
      console.error(error)
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsedData) return

    const result = await addRecipe(parsedData)
    if (result.success) {
      toast.success('Recipe saved')
      setIsOpen(false)
      setParsedData(null)
    } else {
      toast.error('Failed to save recipe')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Importa (PDF/Word)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importa Ricetta</DialogTitle>
        </DialogHeader>
        
        {!parsedData ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg space-y-4">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <FileText className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Carica un file</p>
                  <p className="text-xs text-muted-foreground">PDF o Word supportati</p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Seleziona File
                </Button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Ricetta</Label>
              <Input
                value={parsedData.name}
                onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ingredienti</Label>
              <Textarea
                value={parsedData.ingredients}
                onChange={(e) => setParsedData({ ...parsedData, ingredients: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Preparazione</Label>
              <Textarea
                value={parsedData.instructions}
                onChange={(e) => setParsedData({ ...parsedData, instructions: e.target.value })}
                rows={8}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setParsedData(null)}>Indietro</Button>
              <Button type="submit">Salva Ricetta</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
