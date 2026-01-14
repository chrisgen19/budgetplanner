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
  X,
  ArrowUpCircle,
  ArrowDownCircle
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

// Available colors for categories
const CATEGORY_COLORS = [
  { name: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  { name: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { name: 'rose', bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  { name: 'amber', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  { name: 'cyan', bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  { name: 'teal', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  { name: 'lime', bg: 'bg-lime-100', text: 'text-lime-700', dot: 'bg-lime-500' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
  { name: 'slate', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  { name: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
]

const getColorStyle = (colorName: string) => {
  return CATEGORY_COLORS.find(c => c.name === colorName) || CATEGORY_COLORS[0]
}

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
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryModal, setCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: 'indigo',
  })
  const [categoryError, setCategoryError] = useState('')
  const [categorySaving, setCategorySaving] = useState(false)

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
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)

        // If no categories exist, seed default ones
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
    if (user) {
      fetchCategories()
    }
  }, [user, fetchCategories])

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
    setCategoryModal(true)
  }

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({ name: category.name, type: category.type, color: category.color })
    setCategoryError('')
    setCategoryModal(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')
    setCategorySaving(true)

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category')
      }

      await fetchCategories()
      setCategoryModal(false)
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return

    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  const navItems = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'categories' as TabType, label: 'Categories', icon: Layers },
  ]

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
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 rounded-lg">
                            <ArrowDownCircle size={20} className="text-rose-600" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-slate-800">Expense Categories</h2>
                            <p className="text-sm text-slate-500">{expenseCategories.length} categories</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openAddCategoryModal('expense')}
                          className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      <div className="p-4">
                        {expenseCategories.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">No expense categories yet</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {expenseCategories.map((category) => {
                              const colorStyle = getColorStyle(category.color)
                              return (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${colorStyle.bg} ${colorStyle.text} flex items-center justify-center font-bold text-sm`}>
                                      {category.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">{category.name}</p>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`}></span>
                                        <span className="text-xs text-slate-400 capitalize">{category.color}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openEditCategoryModal(category)}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(category)}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Income Categories */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <ArrowUpCircle size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-slate-800">Income Categories</h2>
                            <p className="text-sm text-slate-500">{incomeCategories.length} categories</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openAddCategoryModal('income')}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      <div className="p-4">
                        {incomeCategories.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">No income categories yet</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {incomeCategories.map((category) => {
                              const colorStyle = getColorStyle(category.color)
                              return (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${colorStyle.bg} ${colorStyle.text} flex items-center justify-center font-bold text-sm`}>
                                      {category.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">{category.name}</p>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`}></span>
                                        <span className="text-xs text-slate-400 capitalize">{category.color}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openEditCategoryModal(category)}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(category)}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
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
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setCategoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-5 space-y-4">
              {categoryError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
                  {categoryError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Groceries"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                    disabled={!!editingCategory}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      categoryForm.type === 'expense'
                        ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                        : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
                    } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                    disabled={!!editingCategory}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      categoryForm.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
                    } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: color.name })}
                      className={`w-full aspect-square rounded-lg ${color.bg} ${color.text} flex items-center justify-center transition-all ${
                        categoryForm.color === color.name
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                    >
                      {categoryForm.color === color.name && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {categorySaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Add Category'
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
