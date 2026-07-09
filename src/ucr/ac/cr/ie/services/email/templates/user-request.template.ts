const SYSTEM_NAME = 'Sistema Hogar de Ancianos';

export interface UserRequestEmailParams {
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  reason: string;
}

export function buildUserRequestSubject(): string {
  return `Solicitud de creación de cuenta - ${SYSTEM_NAME}`;
}

export function buildUserRequestHtml(params: UserRequestEmailParams): string {
  const { requesterName, requesterEmail, requesterPhone, reason } = params;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Solicitud de creación de cuenta</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2933;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr>
            <td>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0b3d91;">Solicitud de creación de cuenta</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Se ha recibido una solicitud de creación de cuenta en <strong>${SYSTEM_NAME}</strong>.</p>
              <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="margin:16px 0;border:1px solid #e5e7eb;border-radius:6px;">
                <tr>
                  <td style="background:#f9fafb;font-weight:700;width:130px;padding:10px 12px;color:#374151;">Solicitante</td>
                  <td style="padding:10px 12px;">${escapeHtml(requesterName)}</td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;font-weight:700;padding:10px 12px;color:#374151;">Correo</td>
                  <td style="padding:10px 12px;">${escapeHtml(requesterEmail)}</td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;font-weight:700;padding:10px 12px;color:#374151;">Teléfono</td>
                  <td style="padding:10px 12px;">${escapeHtml(requesterPhone)}</td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#374151;">Motivo de la solicitud:</p>
              <div style="margin:0 0 16px;padding:12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(reason)}</div>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#6b7280;">Como administrador, puedes revisar esta solicitud y crear la cuenta desde el módulo de gestión de usuarios.</p>
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

export function buildUserRequestText(params: UserRequestEmailParams): string {
  const { requesterName, requesterEmail, requesterPhone, reason } = params;

  return [
    `Se ha recibido una solicitud de creación de cuenta en ${SYSTEM_NAME}.`,
    '',
    `Solicitante: ${requesterName}`,
    `Correo:     ${requesterEmail}`,
    `Teléfono:   ${requesterPhone}`,
    '',
    'Motivo de la solicitud:',
    reason,
    '',
    'Como administrador, puedes revisar esta solicitud y crear la cuenta desde el módulo de gestión de usuarios.',
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