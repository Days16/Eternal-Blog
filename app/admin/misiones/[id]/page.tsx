import { notFound } from 'next/navigation'
import { MissionForm } from '@/components/admin/MissionForm'
import { getMissionForAdmin } from '@/lib/supabase/queries/admin'

type Props = { params: Promise<{ id: string }> }

export default async function EditarMisionPage({ params }: Props) {
  const { id } = await params
  const mission = await getMissionForAdmin(id)
  if (!mission) notFound()

  return <MissionForm mission={mission} />
}
