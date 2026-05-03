import { notFound } from 'next/navigation'
import { EntryForm } from '@/components/admin/EntryForm'
import { getEntryForAdmin } from '@/lib/supabase/queries/admin'

type Props = { params: Promise<{ id: string }> }

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params
  const entry = await getEntryForAdmin(id)
  if (!entry) notFound()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Editar entrada</h1>
      <EntryForm entry={entry} />
    </div>
  )
}
