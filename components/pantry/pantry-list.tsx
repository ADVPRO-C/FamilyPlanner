'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, ShoppingCart, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPantryItem, deletePantryItem, moveToShoppingList, updatePantryQuantity } from '@/app/actions/pantry'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type PantryItem = {
  id: string
  name: string
  quantity: string
  category: string
  lastUsed: Date
}

export function PantryList({ initialItems }: { initialItems: PantryItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemCategory, setNewItemCategory] = useState('Alimentari')
  const [isPending, startTransition] = useTransition()
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)

  const categories = ['Alimentari', 'Casa', 'Igiene', 'Altro']

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName) return

    const formData = new FormData()
    formData.append('name', newItemName)
    formData.append('quantity', newItemQuantity)
    formData.append('category', newItemCategory)

    startTransition(async () => {
      const tempId = Math.random().toString()
      const newItem = {
        id: tempId,
        name: newItemName,
        quantity: newItemQuantity,
        category: newItemCategory,
        lastUsed: new Date(),
        userId: 'temp'
      }

      setItems([newItem, ...items])
      setNewItemName('')
      setNewItemQuantity('1')

      const result = await addPantryItem(formData)
      if (!result.success) {
        toast.error('Failed to add item')
        setItems(items)
      } else {
        toast.success('Added to pantry')
      }
    })
  }

  const handleDelete = async (id: string) => {
    const previousItems = [...items]
    setItems(items.filter(item => item.id !== id))

    startTransition(async () => {
      const result = await deletePantryItem(id)
      if (!result.success) {
        toast.error('Failed to delete item')
        setItems(previousItems)
      } else {
        toast.success('Item deleted')
      }
    })
  }

  const handleMoveToShopping = async (id: string) => {
    startTransition(async () => {
      const result = await moveToShoppingList(id)
      if (result.success) {
        toast.success('Moved to shopping list')
      } else {
        toast.error('Failed to move item')
      }
    })
  }

  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    startTransition(async () => {
      const result = await updatePantryQuantity(editingItem.id, editingItem.quantity)
      if (result.success) {
        toast.success('Quantity updated')
        setItems(items.map(i => i.id === editingItem.id ? editingItem : i))
        setEditingItem(null)
      } else {
        toast.error('Failed to update')
      }
    })
  }

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleAddItem} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Nuovo prodotto"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="w-20 space-y-2">
              <Input
                placeholder="Qt"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="bg-background text-center"
              />
            </div>
            <Button type="submit" size="icon" disabled={isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2">
             <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex flex-col flex-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.quantity} • {item.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveToShopping(item.id)}
                title="Sposta in lista spesa"
              >
                <ShoppingCart className="w-4 h-4 text-blue-500" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifica quantità</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateQuantity} className="space-y-4">
                    <Input
                      value={editingItem?.quantity || ''}
                      onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: e.target.value } : null)}
                      placeholder="Nuova quantità"
                    />
                    <Button type="submit" className="w-full">Salva</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>La dispensa è vuota 📦</p>
          </div>
        )}
      </div>
    </div>
  )
}
