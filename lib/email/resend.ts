import { Resend } from 'resend'

let _client: Resend | null = null

function getResend(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY no está configurada')
    _client = new Resend(key)
  }
  return _client
}

const FROM = process.env.RESEND_FROM ?? 'ETERNIDAD <hola@eternidad.blog>'
const SITE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://eternidad.blog'

export interface SendNewEntryEmailParams {
  to: string[]
  entryTitle: string
  entrySlug: string
  entryType: 'chronicle' | 'codex'
  entryExcerpt?: string | null
}

export async function sendNewEntryEmail({
  to,
  entryTitle,
  entrySlug,
  entryType,
  entryExcerpt,
}: SendNewEntryEmailParams) {
  if (to.length === 0) return

  const path = entryType === 'codex' ? 'codex' : 'cronicas'
  const entryUrl = `${SITE_URL}/${path}/${entrySlug}`
  const unsubscribeUrl = `${SITE_URL}/perfil/editar`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${entryTitle}</title>
</head>
<body style="margin:0;padding:0;background:#0b1119;font-family:'Georgia',serif;color:#eef0f4;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0b1119;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
          <!-- Logo / Cabecera -->
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c89b3c;margin-bottom:8px;">✦ ETERNIDAD ✦</div>
              <div style="font-size:10px;font-family:Arial,sans-serif;color:#4a5568;letter-spacing:2px;text-transform:uppercase;">Nueva ${entryType === 'codex' ? 'entrada del Codex' : 'crónica'}</div>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="background:#131b27;border:1px solid #2c3a52;border-radius:12px;padding:36px 40px;">
              <h1 style="font-family:'Georgia',serif;font-size:28px;font-weight:normal;color:#eef0f4;margin:0 0 16px;line-height:1.2;letter-spacing:-0.5px;">
                ${entryTitle}
              </h1>
              ${entryExcerpt ? `<p style="font-family:'Georgia',serif;font-size:16px;color:#a0aec0;font-style:italic;line-height:1.65;margin:0 0 28px;">${entryExcerpt}</p>` : ''}
              <a href="${entryUrl}" style="display:inline-block;padding:12px 28px;background:#d4a64a;color:#0b1119;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.5px;">
                Leer ahora →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="font-family:Arial,sans-serif;font-size:11px;color:#4a5568;line-height:1.6;margin:0;">
                Recibes este correo porque te suscribiste a las actualizaciones de ETERNIDAD.<br />
                <a href="${unsubscribeUrl}" style="color:#6e8bb8;text-decoration:underline;">Gestionar notificaciones</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const resend = getResend()

  if (to.length === 1) {
    await resend.emails.send({
      from: FROM,
      to: to[0],
      subject: `Nueva publicación: ${entryTitle}`,
      html,
    })
  } else {
    await resend.batch.send(
      to.map(email => ({
        from: FROM,
        to: email,
        subject: `Nueva publicación: ${entryTitle}`,
        html,
      }))
    )
  }
}
