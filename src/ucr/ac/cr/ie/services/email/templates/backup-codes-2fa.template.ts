import { BackupCodesParams } from '../email.types';

const SYSTEM_NAME = 'Sistema Hogar de Ancianos';

export function buildBackupCodesSubject(): string {
  return `Códigos de respaldo 2FA - ${SYSTEM_NAME}`;
}

export function buildBackupCodesHtml(params: BackupCodesParams): string {
  const { to, codes } = params;
  const year = new Date().getFullYear();

  if (!Array.isArray(codes) || codes.length === 0) {
    throw new Error('Se requiere al menos un código de respaldo para generar la plantilla.');
  }

  const cells = codes
    .map(
      (code, idx) => `
        <td style="padding:8px;text-align:center;background:#fef3c7;border:1px solid #fbbf24;border-radius:4px;">
          <div style="font-size:11px;color:#92400e;margin-bottom:2px;">#${idx + 1}</div>
          <div style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#78350f;letter-spacing:1px;">${escapeHtml(code)}</div>
        </td>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Códigos de respaldo 2FA</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2933;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr>
            <td>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0b3d91;">Códigos de respaldo 2FA</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hola <strong>${escapeHtml(to.firstName)}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Acabas de activar la verificación en dos pasos (2FA) en <strong>${SYSTEM_NAME}</strong>. Guarda estos códigos en un lugar seguro. Cada uno puede usarse <strong>una sola vez</strong> si pierdes acceso a tu aplicación autenticadora.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="4" style="margin:16px 0;">
                <tr>${cells}</tr>
              </table>
              <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#b91c1c;"><strong>Importante:</strong> estos códigos no se mostrarán de nuevo. Si los pierdes, podrás regenerarlos desde la página de seguridad de tu cuenta.</p>
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

export function buildBackupCodesText(params: BackupCodesParams): string {
  const { to, codes } = params;
  const lines = codes.map((c, idx) => `  ${idx + 1}. ${c}`);
  return [
    `Hola ${to.firstName},`,
    '',
    `Acabas de activar la verificación en dos pasos (2FA) en ${SYSTEM_NAME}.`,
    'Guarda estos códigos en un lugar seguro. Cada uno puede usarse una sola vez si pierdes acceso a tu aplicación autenticadora.',
    '',
    'Tus códigos de respaldo:',
    ...lines,
    '',
    'Importante: estos códigos no se mostrarán de nuevo. Si los pierdes, podrás regenerarlos desde la página de seguridad de tu cuenta.',
    '',
    SYSTEM_NAME,
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
