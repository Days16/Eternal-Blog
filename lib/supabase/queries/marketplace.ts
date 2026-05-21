import { requireSupabase } from '@/lib/supabase/helpers'

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  type: 'merch' | 'book' | 'digital'
  stock: number
  visible: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CartItem {
  userId: string
  productId: string
  quantity: number
  product: Product
}

export async function isMarketplaceEnabled(): Promise<boolean> {
  try {
    const supabase = requireSupabase()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'marketplace_enabled')
      .maybeSingle()
    return data?.value === 'true'
  } catch {
    return false
  }
}

export async function setMarketplaceEnabled(enabled: boolean): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'marketplace_enabled', value: String(enabled), updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id:          String(row.id ?? ''),
    slug:        String(row.slug ?? ''),
    name:        String(row.name ?? ''),
    description: row.description ? String(row.description) : null,
    price:       Number(row.price ?? 0),
    imageUrl:    row.image_url ? String(row.image_url) : null,
    type:        (row.type ?? 'merch') as Product['type'],
    stock:       Number(row.stock ?? 0),
    visible:     Boolean(row.visible),
    createdAt:   row.created_at ? new Date(String(row.created_at)) : null,
    updatedAt:   row.updated_at ? new Date(String(row.updated_at)) : null,
  }
}

export async function getProducts(onlyVisible = true): Promise<Product[]> {
  const supabase = requireSupabase()
  let query = supabase
    .from('products')
    .select('id,slug,name,description,price,image_url,type,stock,visible,created_at,updated_at')
    .order('created_at', { ascending: true })

  if (onlyVisible) query = query.eq('visible', true)

  const { data } = await query
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('products')
    .select('id,slug,name,description,price,image_url,type,stock,visible,created_at,updated_at')
    .eq('slug', slug)
    .eq('visible', true)
    .maybeSingle()
  return data ? mapProduct(data) : null
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('cart_items')
    .select('user_id,product_id,quantity,products!inner(id,slug,name,description,price,image_url,type,stock,visible,created_at,updated_at)')
    .eq('user_id', userId)

  return (data ?? []).map(row => ({
    userId: row.user_id,
    productId: row.product_id,
    quantity: row.quantity,
    product: mapProduct(row.products as unknown as Record<string, unknown>),
  }))
}

export async function addToCart(userId: string, productId: string, quantity = 1): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: 'user_id,product_id', ignoreDuplicates: false },
    )
  if (error) throw error
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number): Promise<void> {
  if (quantity < 1) throw new Error('La cantidad debe ser al menos 1.')
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

export async function removeFromCart(userId: string, productId: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

export async function createOrder(userId: string): Promise<string> {
  const supabase = requireSupabase()
  const items = await getCartItems(userId)
  if (items.length === 0) throw new Error('El carrito está vacío.')

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemsJson = items.map(item => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }))

  const { data: order, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, total, items_json: itemsJson })
    .select('id')
    .single()

  if (error) throw error

  await supabase.from('cart_items').delete().eq('user_id', userId)

  return order.id
}

export async function getOrders(userId?: string) {
  const supabase = requireSupabase()
  let query = supabase
    .from('orders')
    .select('id,user_id,status,total,items_json,created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (userId) query = query.eq('user_id', userId)

  const { data } = await query
  return (data ?? []).map(row => ({
    id: row.id,
    userId: row.user_id,
    status: row.status as 'pending' | 'paid' | 'shipped' | 'cancelled',
    total: row.total,
    itemsJson: row.items_json,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  }))
}
