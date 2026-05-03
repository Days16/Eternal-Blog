import { EntryForm } from '@/components/admin/EntryForm'

export default function NewEntryPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Nueva entrada</h1>
      <EntryForm />
    </div>
  )
}
