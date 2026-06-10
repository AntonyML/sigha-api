import { PasswordResetParams } from '../email.types';

const SYSTEM_NAME = 'Sistema Hogar de Ancianos';

export function buildPasswordResetSubject(): string {
  return `Recuperación de contraseña - ${SYSTEM_NAME}`;
}

export function buildPasswordResetHtml(params: PasswordResetParams): string {
  const { to, code, expirationLabel = '15 minutos' } = params;
  const formattedCode = code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2933;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr>
            <td>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0b3d91;">Recuperación de contraseña</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hola <strong>${escapeHtml(to.firstName)}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${SYSTEM_NAME}</strong>. Usa el siguiente código de verificación:</p>
              <div style="margin:24px 0;padding:16px;background:#eef2ff;border:1px dashed #4f46e5;border-radius:6px;text-align:center;">
                <span style="font-family:'Courier New',monospace;font-size:28px;letter-spacing:4px;color:#0b3d91;font-weight:700;">${escapeHtml(formattedCode)}</span>
              </div>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.5;">Este código expira en <strong>${escapeHtml(expirationLabel)}</strong>.</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#6b7280;">${year} ${SYSTEM_NAME}. Este es un mensaje automático, por favor no respondas.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetText(params: PasswordResetParams): string {
  const { to, code, expirationLabel = '15 minutos' } = params;
  const formattedCode = code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code;
  return [
    `Hola ${to.firstName},`,
    '',
    `Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${SYSTEM_NAME}.`,
    '',
    `Tu código de verificación es: ${formattedCode}`,
    '',
    `Este código expira en ${expirationLabel}.`,
    '',
    'Si no solicitaste este cambio, puedes ignorar este mensaje.',
    '',
    `${SYSTEM_NAME}`,
  ].join('\n');
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
