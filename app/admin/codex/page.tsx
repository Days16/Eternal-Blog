import { redirect } from 'next/navigation'

export default function AdminCodexPage() {
  redirect('/admin/entradas?type=codex')
}
