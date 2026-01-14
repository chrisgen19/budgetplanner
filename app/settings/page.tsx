'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Layers,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  isDefault: boolean
  order: number
}

type TabType = 'profile' | 'categories'

const COLORS = [
  { name: 'indigo', bg: 'bg-indigo-500' },
  { name: 'emerald', bg: 'bg-emerald-500' },
  { name: 'rose', bg: 'bg-rose-500' },
  { name: 'orange', bg: 'bg-orange-500' },
  { name: 'amber', bg: 'bg-amber-500' },
  { name: 'cyan', bg: 'bg-cyan-500' },
  { name: 'teal', bg: 'bg-teal-500' },
  { name: 'green', bg: 'bg-green-500' },
  { name: 'lime', bg: 'bg-lime-500' },
  { name: 'purple', bg: 'bg-purple-500' },
  { name: 'pink', bg: 'bg-pink-500' },
  { name: 'slate', bg: 'bg-slate-500' },
  { name: 'blue', bg: 'bg-blue-500' },
  { name: 'red', bg: 'bg-red-500' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: 'indigo',
  })
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          setProfileForm({
            name: data.user.name,
            email: data.user.email,
          })
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)

        // Seed default categories if empty
        if (data.length === 0) {
          const seedResponse = await fetch('/api/categories/seed', { method: 'POST' })
          if (seedResponse.ok) {
            const seededData = await seedResponse.json()
            setCategories(seededData)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && activeTab === 'categories') {
      fetchCategories()
    }
  }, [user, activeTab, fetchCategories])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setUser(data.user)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const openAddCategoryModal = (type: 'income' | 'expense') => {
    setEditingCategory(null)
    setCategoryForm({ name: '', type, color: type === 'income' ? 'emerald' : 'indigo' })
    setCategoryError('')
    setCategoryModalOpen(true)
  }

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({ name: category.name, type: category.type, color: category.color })
    setCategoryError('')
    setCategoryModalOpen(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')
    setCategoryLoading(true)

    try {
      if (editingCategory) {
        // Update existing
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryForm.name, color: categoryForm.color }),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update category')
        }
      } else {
        // Create new
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create category')
        }
      }

      setCategoryModalOpen(false)
      fetchCategories()
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete category')
      }
      fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const navItems = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'categories' as TabType, label: 'Categories', icon: Layers },
  ]

  const expenseCategories = categories.filter(c => c.type === 'expense').sort((a, b) => a.order - b.order)
  const incomeCategories = categories.filter(c => c.type === 'income').sort((a, b) => a.order - b.order)

  const getColorBg = (colorName: string) => {
    return COLORS.find(c => c.name === colorName)?.bg || 'bg-slate-500'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Account & Preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
                    <p className="text-sm text-slate-500">Update your account details</p>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                    {profileError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm flex items-center gap-2">
                        <Check size={16} />
                        Profile updated successfully
                      </div>
                    )}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {profileLoading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                    <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                    {passwordError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm flex items-center gap-2">
                        <Check size={16} />
                        Password updated successfully
                      </div>
                    )}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                          placeholder="At least 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                {categoriesLoading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {/* Expense Categories */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">Expense Categories</h2>
                          <p className="text-sm text-slate-500">Categories for tracking expenses</p>
                        </div>
                        <button
                          onClick={() => openAddCategoryModal('expense')}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-medium rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <Plus size={18} />
                          Add Category
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {expenseCategories.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">No expense categories yet</div>
                        ) : (
                          expenseCategories.map((category) => (
                            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${getColorBg(category.color)}`} />
                                <span className="font-medium text-slate-700">{category.name}</span>
                                {category.isDefault && (
                                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Default</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditCategoryModal(category)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Income Categories */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">Income Categories</h2>
                          <p className="text-sm text-slate-500">Categories for tracking income</p>
                        </div>
                        <button
                          onClick={() => openAddCategoryModal('income')}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Plus size={18} />
                          Add Category
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {incomeCategories.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">No income categories yet</div>
                        ) : (
                          incomeCategories.map((category) => (
                            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${getColorBg(category.color)}`} />
                                <span className="font-medium text-slate-700">{category.name}</span>
                                {category.isDefault && (
                                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Default</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditCategoryModal(category)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              {categoryError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
                  {categoryError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="e.g. Groceries, Rent, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: color.name })}
                      className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                        categoryForm.color === color.name
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {categoryLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
