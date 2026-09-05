import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proteccion simple con usuario y contrasena compartidos (Basic Auth) para
// que la herramienta deje de ser publica. Las credenciales se configuran en
// Vercel como variables de entorno (SITE_AUTH_USER / SITE_AUTH_PASSWORD) y
// nunca quedan escritas en el codigo. Si no estan configuradas, se deja
// pasar sin bloquear (para no dejar la app inaccesible por un despliegue
// mal configurado), pero eso solo deberia pasar antes de configurarlas.
function isAuthorized(request: NextRequest): boolean {
    const validUser = process.env.SITE_AUTH_USER;
    const validPassword = process.env.SITE_AUTH_PASSWORD;

  if (!validUser || !validPassword) {
        return true;
  }

  const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
          return false;
    }

  const encoded = authHeader.slice('Basic '.length);
    let decoded: string;
    try {
          decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    } catch {
          return false;
    }

  const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
          return false;
    }
    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

  return user === validUser && password === validPassword;
}

export function proxy(request: NextRequest) {
    if (isAuthorized(request)) {
          return NextResponse.next();
    }

  return new NextResponse('Autenticacion requerida.', {
        status: 401,
        headers: {
                'WWW-Authenticate': 'Basic realm="Bistro BI", charset="UTF-8"',
        },
  });
}

export const config = {
    matcher: [
          '/((?!_next/static|_next/image|favicon.ico|cantina-pink-logo.png).*)',
        ],
};
