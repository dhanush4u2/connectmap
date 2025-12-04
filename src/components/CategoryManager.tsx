import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'
import type { Category } from '../types'

export function CategoryManager() {
  const { user } = useAuthState()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'))
      const cats: Category[] = []
      snapshot.forEach((docSnap) => {
        cats.push({ id: docSnap.id, ...docSnap.data() } as Category)
      })
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory() {
    if (!newCategory.id || !newCategory.label || !newCategory.emoji) {
      alert('Please fill all fields')
      return
    }

    try {
      await addDoc(collection(db, 'categories'), {
        id: newCategory.id,
        label: newCategory.label,
        emoji: newCategory.emoji,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      })
      
      setNewCategory({ id: '', label: '', emoji: '' })
      setIsAdding(false)
      fetchCategories()
      alert('✅ Category added successfully!')
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!confirm('Are you sure? This will affect all places in this category.')) return

    try {
      const docRef = categories.find(c => c.id === categoryId)
      if (docRef) {
        await deleteDoc(doc(db, 'categories', categoryId))
        fetchCategories()
        alert('✅ Category deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12"><div className="loading-spinner" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="card-premium p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gradient mb-1">Manage Categories</h2>
            <p className="text-xs md:text-sm text-slate-400">
              {categories.length} active categories
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary text-sm px-4 py-2"
          >
            {isAdding ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 md:p-6 rounded-2xl bg-bg-warm border border-primary/20">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ID (e.g., food_cafe)</label>
                <input
                  type="text"
                  placeholder="category_id"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                  className="w-full rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Label</label>
                <input
                  type="text"
                  placeholder="Display Name"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                  className="w-full rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Emoji</label>
                <input
                  type="text"
                  placeholder="🍽️"
                  value={newCategory.emoji}
                  onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                  className="w-full rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              className="btn-primary w-full text-sm"
            >
              Add Category
            </button>
          </div>
        )}

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-2">📂</p>
              <p className="text-sm">No categories yet</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-bg-warm border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm md:text-base">{cat.label}</p>
                    <p className="text-xs text-slate-400">{cat.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="px-3 md:px-4 py-2 rounded-full text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
