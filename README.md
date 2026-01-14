# Budget Planner

A modern budget planning application built with Next.js, Prisma, and PostgreSQL. Track your income and expenses with a beautiful calendar interface and monthly forecasting.

## Features

- Calendar view with daily income/expense overview
- Add income and expense transactions
- Recurring transactions (daily, weekly, monthly)
- Monthly analytics dashboard
- 2026 yearly forecast chart
- Category-based organization
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database

### Installation

1. Clone the repository

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Create .env file with your database URL
DATABASE_URL=postgres://user:password@host:5432/budgetplanner
```

4. Generate Prisma client:
```bash
bunx prisma generate
```

5. Push the database schema:
```bash
bunx prisma db push
```

6. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
budgetplanner/
├── app/
│   ├── api/
│   │   └── budget-items/       # REST API endpoints
│   ├── components/
│   │   └── BudgetPlanner.tsx   # Main application component
│   ├── generated/
│   │   └── prisma/             # Generated Prisma client
│   ├── lib/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── prisma/
│   └── schema.prisma           # Database schema
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget-items` | Get all budget items |
| POST | `/api/budget-items` | Create a new item |
| PUT | `/api/budget-items/[id]` | Update an item |
| DELETE | `/api/budget-items/[id]` | Delete an item |

## Database Schema

```prisma
model BudgetItem {
  id           String   @id @default(cuid())
  type         String   // "income" | "expense"
  name         String
  amount       Float
  category     String
  frequency    String   // "one-time" | "daily" | "weekly" | "monthly"
  startDate    String
  endDate      String?
  selectedDays Int[]    // For weekly frequency (0-6)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Categories

**Expense Categories**: Housing, Food, Transport, Utilities, Entertainment, Other

**Income Categories**: Salary, Business, Freelance, Investment, Other

## Scripts

```bash
bun dev       # Start development server
bun build     # Build for production
bun start     # Start production server
bun lint      # Run ESLint
```
