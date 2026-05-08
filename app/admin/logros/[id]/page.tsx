import { notFound } from 'next/navigation'
import { AchievementForm } from '@/components/admin/AchievementForm'
import { getAchievementForAdmin } from '@/lib/supabase/queries/admin'

type Props = { params: Promise<{ id: string }> }

export default async function EditarLogroPage({ params }: Props) {
  const { id } = await params
  const achievement = await getAchievementForAdmin(id)
  if (!achievement) notFound()
  return <AchievementForm achievement={achievement} />
}
