'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { TransactionType } from '@/types'

const MONEY_IN_METHODS = ['M-Pesa', 'Bank Transfer', 'Cash', 'Cheque', 'Crypto', 'Other']
const MONEY_OUT_CATEGORIES = [
  'Salaries & Payroll',
  'Rent & Office',
  'Marketing & Ads',
  'Technology & Software',
  'Travel & Transport',
  'Legal & Compliance',
  'Equipment & Hardware',
  'Utilities',
  'Operations',
  'Other',
]

interface Props {
  type: TransactionType
}

export default function TransactionForm({ type }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'M-Pesa',
    reference_number: '',
    category: 'Operations',
    project_purpose: '',
    description: '',
    notes: '',
  })

  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let proof_url = null
      let proof_filename = null

      // Upload proof if provided
      if (proofFile) {
        const ext = proofFile.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('transaction-proofs')
          .upload(filename, proofFile)

        if (uploadError) throw new Error('Failed to upload proof: ' + uploadError.message)
        proof_url = uploadData.path
        proof_filename = proofFile.name
      }

      const payload: Record<string, unknown> = {
        type,
        date: form.date,
        amount: parseFloat(form.amount),
        description: form.description || null,
        notes: form.notes || null,
        proof_url,
        proof_filename,
        created_by: user.id,
      }

      if (type === 'money_in') {
        payload.payment_method = form.payment_method
        payload.reference_number = form.reference_number || null
      } else {
        payload.category = form.category
        payload.project_purpose = form.project_purpose || null
      }

      const { error: insertError } = await supabase.from('transactions').insert([payload])
      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/transactions')
        router.refresh()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isIn = type === 'money_in'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setField('date', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (KES) *</label>
          <input
            type="number"
            required
            min="1"
            step="0.01"
            value={form.amount}
            onChange={e => setField('amount', e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Type-specific fields */}
      {isIn ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
            <select
              value={form.payment_method}
              onChange={e => setField('payment_method', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            >
              {MONEY_IN_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={form.reference_number}
              onChange={e => setField('reference_number', e.target.value)}
              placeholder="e.g. QAB1234XYZ"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            >
              {MONEY_OUT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project / Purpose</label>
            <input
              type="text"
              value={form.project_purpose}
              onChange={e => setField('project_purpose', e.target.value)}
              placeholder="e.g. Website development"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder={isIn ? 'e.g. Seed round investment tranche 1' : 'e.g. Monthly office rent - July 2026'}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
          rows={3}
          placeholder="Any additional context..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 resize-none"
        />
      </div>

      {/* Proof Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Upload Proof {isIn ? '(Receipt, Bank slip, M-Pesa screenshot)' : '(Receipt or Invoice)'}
        </label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="text-center">
            {proofFile ? (
              <>
                <div className="text-emerald-600 text-sm font-medium">✓ {proofFile.name}</div>
                <div className="text-xs text-slate-400">{(proofFile.size / 1024).toFixed(0)} KB</div>
              </>
            ) : (
              <>
                <div className="text-slate-400 text-sm">Click to upload file</div>
                <div className="text-xs text-slate-300 mt-1">PNG, JPG, PDF up to 10MB</div>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={e => setProofFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100">
          ✓ Transaction recorded successfully! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 ${
          isIn
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {loading ? 'Saving...' : `Record ${isIn ? 'Investment' : 'Expense'}`}
      </button>
    </form>
  )
}
