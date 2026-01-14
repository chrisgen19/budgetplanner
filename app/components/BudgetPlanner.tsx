'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  PieChart,
  Trash2,
  Pencil,
  List,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  LogOut,
  User,
  DollarSign,
  Target,
  BarChart3,
  Layers
} from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string
}

// --- Types ---
interface BudgetItem {
  id: string
  type: 'income' | 'expense'
  name: string
  amount: number
  category: string
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string | null
  selectedDays: number[]
  createdAt: string
  updatedAt: string
}

interface NewItemForm {
  type: 'income' | 'expense'
  name: string
  amount: string
  category: string
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
  selectedDays: number[]
}

interface DayDetail {
  date: Date
  items: BudgetItem[]
  income: number
  expense: number
}

// --- Helper Functions ---
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Expense Categories
const expenseCategories = [
  { name: 'Housing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { name: 'Food', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  { name: 'Transport', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  { name: 'Utilities', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  { name: 'Entertainment', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  { name: 'Other', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
]

// Income Categories
const incomeCategories = [
  { name: 'Salary', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { name: 'Business', color: 'bg-teal-100 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  { name: 'Freelance', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  { name: 'Investment', color: 'bg-lime-100 text-lime-700 border-lime-200', dot: 'bg-lime-500' },
  { name: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' },
]

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// --- Main Component ---
export default function BudgetPlanner() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [items, setItems] = useState<BudgetItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayDetail | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [newItem, setNewItem] = useState<NewItemForm>({
    type: 'expense',
    name: '',
    amount: '',
    category: 'Other',
    frequency: 'one-time',
    startDate: formatDate(new Date(2026, 0, 1)),
    endDate: '',
    selectedDays: [],
  })

  // --- Auth Check ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
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

  // --- Data Fetching ---
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/budget-items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchItems()
    }
  }, [fetchItems, user])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // --- Handlers ---
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const resetForm = () => {
    setNewItem({
      type: 'expense',
      name: '',
      amount: '',
      category: 'Other',
      frequency: 'one-time',
      startDate: formatDate(new Date(2026, 0, 1)),
      endDate: '',
      selectedDays: []
    })
    setEditingId(null)
  }

  const handleOpenAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEditClick = (item: BudgetItem) => {
    setNewItem({
      type: item.type,
      name: item.name,
      amount: String(item.amount),
      category: item.category,
      frequency: item.frequency,
      startDate: item.startDate,
      endDate: item.endDate || '',
      selectedDays: item.selectedDays || [],
    })
    setEditingId(item.id)
    setIsModalOpen(true)
    setSelectedDayDetail(null)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name || !newItem.amount || !newItem.startDate) return
    if (newItem.frequency === 'weekly' && newItem.selectedDays.length === 0) {
      alert("Please select at least one day for weekly recurrence.")
      return
    }

    try {
      const itemData = {
        ...newItem,
        amount: parseFloat(newItem.amount),
      }

      if (editingId) {
        const response = await fetch(`/api/budget-items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (response.ok) {
          await fetchItems()
        }
      } else {
        const response = await fetch('/api/budget-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (response.ok) {
          await fetchItems()
        }
      }
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/budget-items/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchItems()
          if (selectedDayDetail) setSelectedDayDetail(null)
        }
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }

  const toggleDaySelection = (dayIndex: number) => {
    setNewItem(prev => {
      const exists = prev.selectedDays.includes(dayIndex)
      if (exists) {
        return { ...prev, selectedDays: prev.selectedDays.filter(d => d !== dayIndex) }
      } else {
        return { ...prev, selectedDays: [...prev.selectedDays, dayIndex] }
      }
    })
  }

  const getItemsForDate = useCallback((date: Date): BudgetItem[] => {
    const dateStr = formatDate(date)
    const dateObj = new Date(dateStr + 'T00:00:00')

    return items.filter(item => {
      const start = new Date(item.startDate + 'T00:00:00')
      const end = item.endDate ? new Date(item.endDate + 'T00:00:00') : null

      if (dateObj < start) return false
      if (end && dateObj > end) return false

      if (item.frequency === 'one-time') return dateStr === item.startDate
      if (item.frequency === 'daily') return true
      if (item.frequency === 'weekly') return item.selectedDays.includes(dateObj.getDay())
      if (item.frequency === 'monthly') return dateObj.getDate() === start.getDate()
      return false
    })
  }, [items])

  const monthlyStats = useMemo(() => {
    const stats = {
      income: Array(12).fill(0) as number[],
      expense: Array(12).fill(0) as number[],
      savings: Array(12).fill(0) as number[]
    }
    const daysInMonths2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    for (let m = 0; m < 12; m++) {
      let monthIncome = 0
      let monthExpense = 0

      for (let d = 1; d <= daysInMonths2026[m]; d++) {
        const currentDateIter = new Date(2026, m, d)
        const dayItems = getItemsForDate(currentDateIter)

        dayItems.forEach(item => {
          if (item.type === 'income') {
            monthIncome += item.amount
          } else {
            monthExpense += item.amount
          }
        })
      }
      stats.income[m] = monthIncome
      stats.expense[m] = monthExpense
      stats.savings[m] = monthIncome - monthExpense
    }
    return stats
  }, [getItemsForDate])

  const currentMonthIndex = currentDate.getMonth()
  const currentMonthIncome = monthlyStats.income[currentMonthIndex]
  const currentMonthExpense = monthlyStats.expense[currentMonthIndex]
  const currentMonthSavings = monthlyStats.savings[currentMonthIndex]

  // Yearly totals
  const yearlyIncome = monthlyStats.income.reduce((sum, val) => sum + val, 0)
  const yearlyExpense = monthlyStats.expense.reduce((sum, val) => sum + val, 0)
  const yearlySavings = yearlyIncome - yearlyExpense

  // Category breakdown for the current month
  const categoryBreakdown = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)

    const expenseByCategory: Record<string, number> = {}
    const incomeByCategory: Record<string, number> = {}

    // Initialize all categories with 0
    expenseCategories.forEach(cat => { expenseByCategory[cat.name] = 0 })
    incomeCategories.forEach(cat => { incomeByCategory[cat.name] = 0 })

    // Calculate totals for each day in the month
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDateIter = new Date(year, month, d)
      const dayItems = getItemsForDate(currentDateIter)

      dayItems.forEach(item => {
        if (item.type === 'expense') {
          expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.amount
        } else {
          incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount
        }
      })
    }

    // Convert to arrays and sort by amount (highest first)
    const expenseBreakdown = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    const incomeBreakdown = Object.entries(incomeByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    const totalExpense = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0)
    const totalIncome = incomeBreakdown.reduce((sum, item) => sum + item.amount, 0)

    return { expenseBreakdown, incomeBreakdown, totalExpense, totalIncome }
  }, [currentDate, getItemsForDate])

  // Helper to get color style based on category & type
  const getCategoryStyle = (catName: string, type: string) => {
    if (type === 'income') {
      return incomeCategories.find(c => c.name === catName) || incomeCategories[4]
    }
    return expenseCategories.find(c => c.name === catName) || expenseCategories[5]
  }

  const renderCalendarCells = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const cells: React.ReactNode[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="h-28 md:h-36 bg-gray-50/50"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayItems = getItemsForDate(date)
      const isToday = formatDate(new Date()) === formatDate(date)

      // Separate sums for cell display
      const dayIncome = dayItems.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0)
      const dayExpense = dayItems.filter(i => i.type !== 'income').reduce((s, i) => s + i.amount, 0)

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDayDetail({ date, items: dayItems, income: dayIncome, expense: dayExpense })}
          className={`
            group h-28 md:h-36 border-r border-b border-gray-100 p-2
            relative flex flex-col transition-all duration-200
            hover:bg-white hover:shadow-lg hover:z-10 hover:rounded-xl cursor-pointer
            ${isToday ? 'bg-white' : 'bg-white'}
          `}
        >
          {/* Day Header */}
          <div className="flex justify-between items-start mb-1">
            <span className={`
              text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors
              ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'}
            `}>
              {day}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              {dayIncome > 0 && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  +{formatCurrency(dayIncome)}
                </span>
              )}
              {dayExpense > 0 && (
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                  -{formatCurrency(dayExpense)}
                </span>
              )}
            </div>
          </div>

          {/* Pills Container */}
          <div className="flex-1 overflow-hidden space-y-1">
            {dayItems.slice(0, 3).map((item) => {
              const catStyle = getCategoryStyle(item.category, item.type)
              return (
                <div key={item.id} className={`
                  text-[10px] font-medium truncate px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm
                  ${catStyle.color}
                `}>
                  <div className={`w-1 h-1 rounded-full ${catStyle.dot}`}></div>
                  <span className="truncate flex-1">{item.name}</span>
                </div>
              )
            })}
            {dayItems.length > 3 && (
              <div className="text-[10px] text-slate-400 pl-2 font-medium">
                +{dayItems.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }
    return cells
  }

  // Don't render until auth is checked
  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-blue-100">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Budget<span className="text-blue-600">Planner</span></h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">2026 Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Transaction</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <User size={16} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Income */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <ArrowUpCircle size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                {months[currentDate.getMonth()]}
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatCurrency(currentMonthIncome)}</div>
              <p className="text-emerald-600 text-sm font-medium">Total Income</p>
            </div>
          </div>

          {/* Card 2: Expense */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full translate-x-8 -translate-y-8 opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                <ArrowDownCircle size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                 {months[currentDate.getMonth()]}
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatCurrency(currentMonthExpense)}</div>
              <p className="text-rose-500 text-sm font-medium">Total Expenses</p>
            </div>
          </div>

           {/* Card 3: Savings Forecast */}
           <div className={`
              relative overflow-hidden rounded-3xl p-6 shadow-sm border transition-shadow group
              ${currentMonthSavings >= 0 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white border-slate-100'}
           `}>
             {currentMonthSavings >= 0 ? (
               // Positive State
               <>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-2xl text-white">
                      <PiggyBank size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-indigo-800/30 px-2 py-1 rounded-md">Net</span>
                 </div>
                 <div className="relative z-10">
                    <div className="text-3xl font-extrabold mb-1">{formatCurrency(currentMonthSavings)}</div>
                    <p className="text-indigo-100 text-sm font-medium">Projected Savings</p>
                 </div>
               </>
             ) : (
               // Negative State
                <>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-10 -translate-y-10"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Net</span>
                 </div>
                 <div className="relative z-10">
                    <div className="text-3xl font-extrabold text-red-600 mb-1">{formatCurrency(currentMonthSavings)}</div>
                    <p className="text-red-400 text-sm font-medium">Over Budget</p>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Analytics Cards - Yearly Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 4: Yearly Income Forecast */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full translate-x-8 -translate-y-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                2026
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatCurrency(yearlyIncome)}</div>
              <p className="text-teal-600 text-sm font-medium">Yearly Income Forecast</p>
            </div>
          </div>

          {/* Card 5: Yearly Expense Forecast */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full translate-x-8 -translate-y-8 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <DollarSign size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                2026
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatCurrency(yearlyExpense)}</div>
              <p className="text-orange-600 text-sm font-medium">Yearly Expense Forecast</p>
            </div>
          </div>

          {/* Card 6: Yearly Net Savings */}
          <div className={`
            relative overflow-hidden rounded-3xl p-6 shadow-sm border transition-shadow group
            ${yearlySavings >= 0 ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white border-violet-500' : 'bg-white border-slate-100'}
          `}>
            {yearlySavings >= 0 ? (
              // Positive State
              <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl text-white">
                    <Target size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-200 bg-violet-800/30 px-2 py-1 rounded-md">2026</span>
                </div>
                <div className="relative z-10">
                  <div className="text-3xl font-extrabold mb-1">{formatCurrency(yearlySavings)}</div>
                  <p className="text-violet-100 text-sm font-medium">Yearly Net Savings</p>
                </div>
              </>
            ) : (
              // Negative State
              <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                    <TrendingDown size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">2026</span>
                </div>
                <div className="relative z-10">
                  <div className="text-3xl font-extrabold text-red-600 mb-1">{formatCurrency(yearlySavings)}</div>
                  <p className="text-red-400 text-sm font-medium">Yearly Deficit</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Overview (Forecast) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart size={20} className="text-slate-400"/>
              <h3 className="text-lg font-bold text-slate-800">2026 Monthly Forecast</h3>
            </div>

            <div className="flex items-end gap-2 h-32 w-full">
              {monthlyStats.savings.map((val, idx) => {
                const maxVal = Math.max(...monthlyStats.income, ...monthlyStats.expense, 1)
                // Normalized heights
                const incomeH = Math.max((monthlyStats.income[idx] / maxVal) * 100, 0)
                const expenseH = Math.max((monthlyStats.expense[idx] / maxVal) * 100, 0)
                const isCurr = idx === currentDate.getMonth()

                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end gap-1 group relative h-full">
                    <div className="flex gap-0.5 items-end h-full justify-center w-full px-0.5">
                       {/* Income Bar */}
                       <div
                         className={`w-1/2 rounded-t-sm transition-all duration-500 opacity-80 ${isCurr ? 'bg-emerald-500' : 'bg-emerald-200 group-hover:bg-emerald-400'}`}
                         style={{ height: `${incomeH}%` }}
                       ></div>
                       {/* Expense Bar */}
                       <div
                         className={`w-1/2 rounded-t-sm transition-all duration-500 opacity-80 ${isCurr ? 'bg-rose-500' : 'bg-rose-200 group-hover:bg-rose-400'}`}
                         style={{ height: `${expenseH}%` }}
                       ></div>
                    </div>

                     {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 w-32 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                      <div className="font-bold mb-1 border-b border-gray-700 pb-1">{months[idx]}</div>
                      <div className="flex justify-between text-emerald-400"><span>In:</span> <span>{formatCurrency(monthlyStats.income[idx])}</span></div>
                      <div className="flex justify-between text-rose-400"><span>Out:</span> <span>{formatCurrency(monthlyStats.expense[idx])}</span></div>
                      <div className="flex justify-between text-white mt-1 pt-1 border-t border-gray-700 font-bold">
                        <span>Net:</span> <span>{formatCurrency(monthlyStats.savings[idx])}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-center text-slate-400 font-medium">
                      {months[idx].substring(0,3)}
                    </div>
                  </div>
                )
              })}
            </div>
        </div>

        {/* Main Calendar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {months[currentDate.getMonth()]}
              <span className="text-slate-300 font-light text-xl">|</span>
              <span className="text-slate-400 font-medium text-lg">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {daysOfWeek.map(day => (
              <div key={day} className="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 bg-slate-50/30">
            {loading ? (
              <div className="col-span-7 h-96 flex items-center justify-center text-slate-400 font-medium animate-pulse">
                Setting up your calendar...
              </div>
            ) : (
              renderCalendarCells()
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <List size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
                <p className="text-xs text-slate-500 font-medium">Recurring Income & Expenses</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
              {items.length} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Schedule</th>
                  <th className="px-6 py-4 font-semibold text-right tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Wallet size={48} className="text-slate-200" strokeWidth={1}/>
                        <p>No items added yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const catStyle = getCategoryStyle(item.category, item.type)
                    const isIncome = item.type === 'income'
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${catStyle.color}`}>
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-medium">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {isIncome ? '+' : ''}{formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {item.type}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="capitalize text-slate-700 font-medium px-2 py-0.5 bg-slate-100 rounded-md w-fit text-xs border border-slate-200">
                              {item.frequency}
                            </span>
                            {item.frequency === 'weekly' && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.selectedDays.map(d => daysOfWeek[d].slice(0,3)).join(', ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Expense Breakdown</h3>
                  <p className="text-xs text-slate-500 font-medium">{months[currentDate.getMonth()]} spending by category</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold">
                {formatCurrency(categoryBreakdown.totalExpense)}
              </span>
            </div>
            <div className="p-6">
              {categoryBreakdown.expenseBreakdown.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-slate-400 py-8">
                  <Wallet size={40} className="text-slate-200" strokeWidth={1}/>
                  <p className="text-sm">No expenses this month</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.expenseBreakdown.map((item, index) => {
                    const catStyle = expenseCategories.find(c => c.name === item.category) || expenseCategories[5]
                    const percentage = categoryBreakdown.totalExpense > 0
                      ? (item.amount / categoryBreakdown.totalExpense) * 100
                      : 0
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${catStyle.color}`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800">{item.category}</p>
                              <p className="text-xs text-slate-400">{percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${catStyle.dot}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Income Breakdown</h3>
                  <p className="text-xs text-slate-500 font-medium">{months[currentDate.getMonth()]} earnings by source</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                {formatCurrency(categoryBreakdown.totalIncome)}
              </span>
            </div>
            <div className="p-6">
              {categoryBreakdown.incomeBreakdown.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-slate-400 py-8">
                  <Wallet size={40} className="text-slate-200" strokeWidth={1}/>
                  <p className="text-sm">No income this month</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.incomeBreakdown.map((item, index) => {
                    const catStyle = incomeCategories.find(c => c.name === item.category) || incomeCategories[4]
                    const percentage = categoryBreakdown.totalIncome > 0
                      ? (item.amount / categoryBreakdown.totalIncome) * 100
                      : 0
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${catStyle.color}`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800">{item.category}</p>
                              <p className="text-xs text-slate-400">{percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-600 font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${catStyle.dot}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        {(categoryBreakdown.totalIncome > 0 || categoryBreakdown.totalExpense > 0) && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <PiggyBank size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Monthly Savings Rate</h3>
                  <p className="text-slate-400 text-sm">{months[currentDate.getMonth()]} financial health indicator</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {categoryBreakdown.totalIncome > 0
                      ? ((categoryBreakdown.totalIncome - categoryBreakdown.totalExpense) / categoryBreakdown.totalIncome * 100).toFixed(1)
                      : '0.0'
                    }%
                  </p>
                  <p className="text-xs text-slate-400">Savings Rate</p>
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${currentMonthSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(currentMonthSavings)}
                  </p>
                  <p className="text-xs text-slate-400">{currentMonthSavings >= 0 ? 'Net Savings' : 'Deficit'}</p>
                </div>
                <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
                <div className="text-center hidden md:block">
                  <p className="text-2xl font-bold text-amber-400">
                    {categoryBreakdown.expenseBreakdown[0]?.category || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400">Top Expense</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Credit */}
        <div className="text-center text-slate-300 text-xs py-4 font-medium">
           Designed with precision for 2026
        </div>

      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-100 ring-4 ring-slate-900/5">
            <div className={`p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 ${newItem.type === 'income' ? 'bg-emerald-50' : 'bg-white'}`}>
              <div>
                <h3 className={`font-bold text-xl ${newItem.type === 'income' ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {editingId ? 'Edit Transaction' : 'New Transaction'}
                </h3>
                <p className={`text-xs ${newItem.type === 'income' ? 'text-emerald-600' : 'text-slate-500'}`}>Enter details for your budget</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5">

              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewItem({...newItem, type: 'expense', category: 'Other'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newItem.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setNewItem({...newItem, type: 'income', category: 'Salary'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newItem.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  placeholder={newItem.type === 'income' ? "e.g., Paycheck" : "e.g., Netflix"}
                  required
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none border"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Amount</label>
                  <div className="relative">
                     <span className="absolute left-3 top-3 text-slate-400 font-bold">₱</span>
                     <input
                      type="number"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none border"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none appearance-none border"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  >
                    {(newItem.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Frequency</label>
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {(['one-time', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setNewItem({...newItem, frequency: freq})}
                      className={`text-xs py-2 rounded-lg font-semibold capitalize transition-all ${newItem.frequency === freq ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Frequency Fields */}
              <div className="bg-slate-50/50 p-4 rounded-xl space-y-4 border border-slate-100">

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Start Date</label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-lg border-slate-200 text-slate-600 text-xs py-2 px-2 focus:ring-blue-500 focus:border-blue-500 border"
                      value={newItem.startDate}
                      onChange={(e) => setNewItem({...newItem, startDate: e.target.value})}
                    />
                  </div>
                  {newItem.frequency !== 'one-time' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">End Date (Opt)</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border-slate-200 text-slate-600 text-xs py-2 px-2 focus:ring-blue-500 focus:border-blue-500 border"
                        value={newItem.endDate}
                        onChange={(e) => setNewItem({...newItem, endDate: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* Weekly Picker */}
                {newItem.frequency === 'weekly' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Repeat On</label>
                    <div className="flex justify-between gap-1">
                      {daysOfWeek.map((day, idx) => {
                        const isSelected = newItem.selectedDays.includes(idx)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDaySelection(idx)}
                            className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
                          >
                            {day[0]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {newItem.frequency === 'monthly' && (
                   <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 p-2 rounded-lg border border-blue-100">
                     <CalendarIcon size={14} className="text-blue-500"/>
                     <span>Repeats on the <strong>{new Date(newItem.startDate).getDate()}{(['','st','nd','rd'][((new Date(newItem.startDate).getDate())/10%10)^1&&new Date(newItem.startDate).getDate()%10]||'th')}</strong> of every month.</span>
                   </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${newItem.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-900 hover:bg-black'}`}
              >
                {editingId ? 'Save Changes' : newItem.type === 'income' ? 'Add Income' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Day Detail Modal (Mobile Friendly) */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelectedDayDetail(null)}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center relative overflow-hidden">
               {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

              <div className="relative z-10">
                <h3 className="font-bold text-xl">{selectedDayDetail.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                <div className="flex gap-4 text-xs mt-1 opacity-90">
                   <span className="text-emerald-300">+{formatCurrency(selectedDayDetail.income)}</span>
                   <span className="text-rose-300">-{formatCurrency(selectedDayDetail.expense)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDayDetail(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10"><X size={20} /></button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-50">
              {selectedDayDetail.items.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <CalendarIcon size={24} />
                  </div>
                  <p className="text-slate-400 font-medium">No activity for this day.</p>
                  <button
                    onClick={() => {
                      setNewItem(prev => ({ ...prev, startDate: formatDate(selectedDayDetail.date) }))
                      setIsModalOpen(true)
                      setSelectedDayDetail(null)
                    }}
                    className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-full text-blue-600 text-sm font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    Add Transaction
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayDetail.items.map((item) => {
                    const catStyle = getCategoryStyle(item.category, item.type)
                    const isIncome = item.type === 'income'
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-10 rounded-full ${catStyle.dot.replace('bg-', 'bg-')}`}></div>
                           <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <div className="flex gap-2 text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                              <span>{item.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                          <div className="flex gap-1">
                            <button
                                onClick={() => handleEditClick(item)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                              >
                                <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-4 border-t border-slate-200 mt-4">
                     <button
                      onClick={() => {
                         setNewItem(prev => ({ ...prev, startDate: formatDate(selectedDayDetail.date) }))
                         setIsModalOpen(true)
                         setSelectedDayDetail(null)
                      }}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
