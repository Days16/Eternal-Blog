import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isModeratorOrAbove } from '@/lib/auth/roles'
import {
  isMarketplaceEnabled, getProducts, getOrders,
} from '@/lib/supabase/queries/marketplace'
import { MarketplaceToggle } from './MarketplaceToggle'

export default async function AdminTiendaPage() {
  const session = await auth()
  if (!session?.user || !isModeratorOrAbove(session.user.role)) redirect('/admin')

  const [enabled, products, orders] = await Promise.all([
    isMarketplaceEnabled(),
    getProducts(false),
    getOrders(),
  ])

  const ORDER_STATUS: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Pendiente', color: 'var(--spore)' },
    paid:      { label: 'Pagado',    color: 'var(--mist)' },
    shipped:   { label: 'Enviado',   color: 'var(--amethyst)' },
    cancelled: { label: 'Cancelado', color: 'var(--ember)' },
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, margin: '0 0 6px' }}>
          Tienda
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontSize: 14, margin: 0 }}>
          Gestión del Mercado Arcano. Activa la tienda para que sea visible públicamente.
        </p>
      </div>

      {/* Toggle de activación */}
      <div style={{ marginBottom: 40, padding: '20px 24px', background: 'var(--bg-card)', border: `1px solid ${enabled ? 'var(--spore)' : 'var(--border-soft)'}`, borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Estado de la tienda
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)' }}>
            {enabled
              ? 'La tienda está activa y visible para todos los usuarios.'
              : 'La tienda está oculta. Solo visible para administradores.'}
          </div>
        </div>
        <MarketplaceToggle enabled={enabled} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Productos',  value: products.length,                      color: 'var(--spore)' },
          { label: 'Visibles',   value: products.filter(p => p.visible).length, color: 'var(--mist)' },
          { label: 'Pedidos',    value: orders.length,                        color: 'var(--amethyst)' },
          { label: 'Pendientes', value: orders.filter(o => o.status === 'pending').length, color: 'var(--rune)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ padding: '20px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 6 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Productos */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Productos</h2>
      {products.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic', marginBottom: 40 }}>
          No hay productos. Crea productos desde la base de datos por ahora.
        </p>
      ) : (
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(product => (
            <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, flex: 1, minWidth: 160 }}>
                {product.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--spore)' }}>
                {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase' }}>
                stock: {product.stock}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 99,
                fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1,
                background: product.visible ? 'var(--mist)18' : 'var(--moss-800)',
                color: product.visible ? 'var(--mist)' : 'var(--text-mute)',
                border: `1px solid ${product.visible ? 'var(--mist)' : 'var(--border)'}`,
              }}>
                {product.visible ? 'visible' : 'oculto'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pedidos */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Pedidos recientes</h2>
      {orders.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic' }}>
          Aún no hay pedidos.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const st = ORDER_STATUS[order.status] ?? { label: order.status, color: 'var(--text-mute)' }
            return (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', flex: 1 }}>
                  #{order.id.slice(0, 8)} · {order.createdAt?.toLocaleDateString('es-ES') ?? '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--spore)' }}>
                  {Number(order.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 99,
                  fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1,
                  background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}44`,
                }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
