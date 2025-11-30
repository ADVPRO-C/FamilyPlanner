'use client'

import { useMemo, useState, useTransition } from 'react'
import { Plus, Trash2, ShoppingCart, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPantryItem, deletePantryItem, moveToShoppingList, updatePantryItem } from '@/app/actions/pantry'
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
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [stockFilter, setStockFilter] = useState<'tutti' | 'quasi' | 'esaurito'>('tutti')

  const categoryFilters = ['Tutti', 'Alimentari', 'Casa', 'Detersivi', 'Altro']
  const categories = categoryFilters.filter((category) => category !== 'Tutti')

  const normalizedItems = useMemo(() => {
    return items.map(item => {
      const qtyValue = parseFloat(item.quantity) || 0
      const stockStatus = qtyValue <= 0 ? 'esaurito' : qtyValue <= 2 ? 'quasi' : 'ok'
      return {
        ...item,
        qtyValue,
        stockStatus,
      }
    })
  }, [items])

  const filteredItems = useMemo(() => {
    let list =
      activeCategory === 'Tutti'
        ? normalizedItems
        : normalizedItems.filter(item => item.category === activeCategory)

    if (stockFilter === 'quasi') {
      list = list.filter(item => item.stockStatus === 'quasi')
    } else if (stockFilter === 'esaurito') {
      list = list.filter(item => item.stockStatus === 'esaurito')
    }

    return [...list].sort((a, b) => {
      if (stockFilter === 'tutti') {
        if (a.qtyValue === b.qtyValue) {
          return a.name.localeCompare(b.name)
        }
        return a.qtyValue - b.qtyValue
      }
      // When filtering by status keep same ordering but prioritize lower stock
      if (a.qtyValue === b.qtyValue) {
        return a.name.localeCompare(b.name)
      }
      return a.qtyValue - b.qtyValue
    })
  }, [activeCategory, normalizedItems, stockFilter])

  const stockBadge = (quantity: string) => {
    const value = parseFloat(quantity)
    if (Number.isNaN(value) || value <= 0) {
      return { color: 'bg-red-500', label: 'Esaurito' }
    }
    if (value <= 2) {
      return { color: 'bg-yellow-400', label: 'Quasi finito' }
    }
    return { color: 'bg-green-500', label: 'Disponibile' }
  }

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

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    startTransition(async () => {
      const result = await updatePantryItem(editingItem.id, editingItem.quantity, editingItem.category)
      if (result.success) {
        toast.success('Prodotto aggiornato')
        setItems(items.map(i => i.id === editingItem.id ? editingItem : i))
        setEditingItem(null)
      } else {
        toast.error('Impossibile aggiornare il prodotto')
      }
    })
  }

  const categoryBadgeClasses = (category: string) => {
    switch (category) {
      case 'Alimentari':
        return 'bg-green-500 text-white'
      case 'Casa':
        return 'bg-red-500 text-white'
      case 'Detersivi':
        return 'bg-blue-500 text-white'
      case 'Altro':
        return 'bg-violet-600 text-white'
      case 'Tutti':
        return 'bg-gray-700 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-6 pb-20 w-full px-3 sm:px-4 lg:px-8 max-w-full lg:max-w-6xl lg:mx-auto">
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

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryFilters.map(category => (
          <Button
            key={category}
            size="sm"
            variant={category === activeCategory ? 'default' : 'outline'}
            className="flex-shrink-0"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { label: 'Tutti', value: 'tutti' as const },
          { label: 'In esaurimento', value: 'quasi' as const },
          { label: 'Esauriti', value: 'esaurito' as const },
        ].map(filter => (
          <Button
            key={filter.value}
            size="sm"
            variant={stockFilter === filter.value ? 'default' : 'outline'}
            className="flex-shrink-0"
            onClick={() => setStockFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map(item => {
          const badge = stockBadge(item.quantity)
          return (
            <div
              key={item.id}
              className="p-4 border rounded-2xl bg-card flex flex-col gap-2 shadow-sm"
            >
              <div>
                <p className="font-semibold text-base line-clamp-2">{item.name}</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${categoryBadgeClasses(item.category)}`}
                >
                  {item.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Quantità: {item.quantity}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-3 h-3 rounded-full ${badge.color}`} aria-label={badge.label}></span>
                  <span>{badge.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-1"
                  onClick={() => handleMoveToShopping(item.id)}
                  title="Sposta in lista spesa"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-1"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifica prodotto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateItem} className="space-y-4">
                      <Input
                        value={editingItem?.quantity || ''}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: e.target.value } : null)}
                        placeholder="Nuova quantità"
                      />
                      <Select
                        value={editingItem?.category || 'Alimentari'}
                        onValueChange={(value) =>
                          setEditingItem(prev => prev ? { ...prev, category: value } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="submit" className="w-full">Salva</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-1 text-destructive hover:text-destructive/90"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            <p>Nessun prodotto in questa categoria</p>
          </div>
        )}
      </div>
    </div>
  )
}
