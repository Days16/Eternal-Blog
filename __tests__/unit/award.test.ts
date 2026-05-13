import { beforeEach, describe, expect, it, vi } from 'vitest'
import { awardXP } from '@/lib/xp/award'
import { requireSupabase } from '@/lib/supabase/helpers'
import { evaluateAchievements } from '@/lib/achievements/evaluator'
import { evaluateMissions } from '@/lib/missions/evaluator'
import { checkAndUpdateStreak } from '@/lib/xp/streak'

vi.mock('@/lib/supabase/helpers', () => ({
  requireSupabase: vi.fn(),
}))

vi.mock('@/lib/achievements/evaluator', () => ({
  evaluateAchievements: vi.fn(),
}))

vi.mock('@/lib/missions/evaluator', () => ({
  evaluateMissions: vi.fn(),
}))

vi.mock('@/lib/xp/streak', () => ({
  checkAndUpdateStreak: vi.fn(),
}))

type RpcSuccessRow = {
  new_xp: number
  new_level: number
  leveled_up: boolean
}

type UserRecord = {
  xp: number
  level: number
}

function createSupabaseMock(options?: {
  user?: UserRecord | null
  rpcResult?: RpcSuccessRow[] | null
  rpcErrorMessage?: string
}) {
  const maybeSingle = vi.fn(async () => ({ data: options?.user ?? null }))
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const insert = vi.fn(async () => ({ data: null, error: null }))
  const from = vi.fn((table: string) => {
    if (table === 'users') return { select }
    if (table === 'activity_log') return { insert }
    throw new Error(`Tabla inesperada: ${table}`)
  })
  const rpc = vi.fn(async () => ({
    data: options?.rpcResult ?? null,
    error: options?.rpcErrorMessage ? { message: options.rpcErrorMessage } : null,
  }))

  return {
    supabase: { from, rpc },
    insert,
    rpc,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkAndUpdateStreak).mockResolvedValue({ streakBonus: 0, newStreak: 1 })
  vi.mocked(evaluateAchievements).mockResolvedValue([])
  vi.mocked(evaluateMissions).mockResolvedValue([])
})

describe('awardXP', () => {
  it('retorna los datos del usuario si amount === 0 sin llamar la RPC', async () => {
    const mock = createSupabaseMock({ user: { xp: 42, level: 2 } })
    vi.mocked(requireSupabase).mockReturnValue(mock.supabase as unknown as ReturnType<typeof requireSupabase>)

    const result = await awardXP('user-1', 0, 'comment')

    expect(result).toEqual({ newXp: 42, newLevel: 2, leveledUp: false })
    expect(mock.rpc).not.toHaveBeenCalled()
    expect(mock.insert).not.toHaveBeenCalled()
    expect(evaluateMissions).not.toHaveBeenCalled()
    expect(evaluateAchievements).not.toHaveBeenCalled()
  })

  it('lanza error si la RPC falla', async () => {
    const mock = createSupabaseMock({ rpcErrorMessage: 'boom' })
    vi.mocked(requireSupabase).mockReturnValue(mock.supabase as unknown as ReturnType<typeof requireSupabase>)

    await expect(awardXP('user-2', 10, 'comment', 'ref-1')).rejects.toThrow('[xp] RPC add_xp falló: boom')
    expect(mock.insert).not.toHaveBeenCalled()
  })

  it('retorna newXp, newLevel y leveledUp correctos', async () => {
    const mock = createSupabaseMock({
      rpcResult: [{ new_xp: 120, new_level: 2, leveled_up: true }],
    })
    vi.mocked(requireSupabase).mockReturnValue(mock.supabase as unknown as ReturnType<typeof requireSupabase>)

    const result = await awardXP('user-3', 20, 'comment', 'comment-1')

    expect(result).toEqual({ newXp: 120, newLevel: 2, leveledUp: true })
    expect(mock.rpc).toHaveBeenCalledWith('add_xp', { p_user_id: 'user-3', p_delta: 20 })
    expect(mock.insert).toHaveBeenCalledWith({
      user_id: 'user-3',
      kind: 'comment',
      ref_id: 'comment-1',
      xp_delta: 20,
    })
    expect(evaluateMissions).toHaveBeenCalledWith('user-3')
    expect(evaluateAchievements).toHaveBeenCalledWith('user-3')
  })
})
