export type TransactionType = 'money_in' | 'money_out'

export type MoneyInCategory = 'bank_transfer' | 'mpesa' | 'cash' | 'cheque' | 'crypto' | 'other'

export type MoneyOutCategory =
  | 'salaries'
  | 'rent'
  | 'marketing'
  | 'technology'
  | 'travel'
  | 'legal'
  | 'equipment'
  | 'utilities'
  | 'operations'
  | 'other'

export interface Transaction {
  id: string
  type: TransactionType
  date: string
  amount: number
  payment_method?: string
  reference_number?: string
  category?: string
  project_purpose?: string
  description?: string
  notes?: string
  proof_url?: string
  proof_filename?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  role: 'founder' | 'investor'
  full_name?: string
  created_at: string
}

export interface DashboardStats {
  totalIn: number
  totalOut: number
  balance: number
  transactionCount: number
}

export interface TransactionWithBalance extends Transaction {
  running_balance: number
}
