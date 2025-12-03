'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Check, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem, moveShoppingItemToPantry } from '@/app/actions/shopping-list'
import { addToHistory } from '@/app/actions/budget'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"


type ShoppingItem = {
  id: string
  name: string
  quantity: string
  checked: boolean
  category: string
}

import { motion, AnimatePresence } from 'framer-motion'

export function ShoppingList({ initialItems }: { initialItems: ShoppingItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemCategory, setNewItemCategory] = useState('Alimentari')
  const [isPending, startTransition] = useTransition()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutPrices, setCheckoutPrices] = useState<Record<string, string>>({})
  const [manualTotal, setManualTotal] = useState('')

  const categories = ['Tutti', 'Alimentari', 'Casa', 'Detersivi', 'Altro']

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
        checked: false,
        category: newItemCategory,
      }
      setItems([newItem, ...items])
      setNewItemName('')
      setNewItemQuantity('1')

      const result = await addShoppingItem(formData)
      if (!result.success) {
        toast.error('Failed to add item')
        setItems(items)
      } else {
        toast.success('Item added')
      }
    })
  }

  const handleToggle = async (id: string, checked: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, checked } : item))
    startTransition(async () => {
      await toggleShoppingItem(id, checked)
    })
  }

  const handleDelete = async (id: string) => {
    const previousItems = [...items]
    setItems(items.filter(item => item.id !== id))
    startTransition(async () => {
      const result = await deleteShoppingItem(id)
      if (!result.success) {
        setItems(previousItems)
      }
    })
  }

  const handleMoveToPantry = async (id: string) => {
    const previousItems = [...items]
    setItems(items.filter(item => item.id !== id))
    startTransition(async () => {
      const result = await moveShoppingItemToPantry(id)
      if (result.success) {
        toast.success('Spostato in dispensa')
      } else {
        toast.error('Errore durante lo spostamento')
        setItems(previousItems)
      }
    })
  }

  const handleCheckout = async () => {
    const checkedItems = items.filter(i => i.checked)
    if (checkedItems.length === 0) return

    startTransition(async () => {
      const historyItems = checkedItems.map(item => {
        const parsedPrice = parseFloat(checkoutPrices[item.id] || '0')
        return {
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
        }
      })

      const requestedTotal = manualTotal.trim() !== '' ? parseFloat(manualTotal) : undefined
      const totalOverride =
        requestedTotal !== undefined && !Number.isNaN(requestedTotal) ? requestedTotal : undefined

      const result = await addToHistory(historyItems, totalOverride)
      if (result.success) {
        await Promise.all(checkedItems.map(item => deleteShoppingItem(item.id)))
        setItems(items.filter(i => !i.checked))
        setIsCheckoutOpen(false)
        setCheckoutPrices({})
        setManualTotal('')
        toast.success('Spesa conclusa e budget aggiornato!')
      } else {
        toast.error('Errore durante il checkout')
      }
    })
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0
    return a.checked ? 1 : -1
  })

  const checkedItems = items.filter(i => i.checked)
  const checkedCount = checkedItems.length
  const calculatedTotal = checkedItems.reduce((acc, item) => {
    const price = parseFloat(checkoutPrices[item.id] || '0')
    return acc + (Number.isNaN(price) ? 0 : price)
  }, 0)
  const totalInputValue =
    manualTotal !== ''
      ? manualTotal
      : calculatedTotal > 0
        ? calculatedTotal.toFixed(2)
        : ''

  return (
    <div className="space-y-6 pb-24">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleAddItem} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Cosa serve?"
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

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              key={item.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20",
                item.checked && "opacity-60 bg-muted/50"
              )}
            >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => handleToggle(item.id, !item.checked)}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border transition-colors",
                  item.checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                )}
              >
                {item.checked && <Check className="w-4 h-4" />}
              </button>
              <div className="flex flex-col">
                <span className={cn("font-medium", item.checked && "line-through")}>{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.quantity} • {item.category}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => handleMoveToPantry(item.id)}
                title="Sposta in dispensa"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>La lista è vuota 🎉</p>
          </div>
        )}
      </div>

      {checkedCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center z-40 pointer-events-none">
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg pointer-events-auto gap-2" size="lg">
                <ShoppingBag className="w-5 h-5" />
                Concludi Spesa ({checkedCount})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Concludi Spesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">Inserisci i prezzi per aggiornare il budget.</p>
                {checkedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1 text-sm truncate">{item.name}</div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="€ 0.00"
                        value={checkoutPrices[item.id] || ''}
                        onChange={(e) => setCheckoutPrices({ ...checkoutPrices, [item.id]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 border-t pt-4">
                  <div className="flex-1 font-medium uppercase text-sm">Totale</div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="€ 0.00"
                      value={totalInputValue}
                      onChange={(e) => setManualTotal(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Vuoto = somma automatica
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCheckout} disabled={isPending}>
                  Conferma e Archivia
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
