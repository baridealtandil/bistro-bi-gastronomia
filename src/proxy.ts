import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proteccion con dos usuarios (Basic Auth) para que la herramienta deje de
// ser publica: un usuario "admin" (acceso total) y un usuario "colab"
// (acceso restringido, controlado del lado del cliente en funcion de la
// cookie `login_role` que se setea aca). Las credenciales se configuran en
// Vercel como variables de entorno y nunca quedan escritas en el codigo:
//   - SITE_AUTH_ADMIN_USER / SITE_AUTH_ADMIN_PASSWORD
//   - SITE_AUTH_COLAB_USER / SITE_AUTH_COLAB_PASSWORD
// Por compatibilidad con la configuracion anterior, si no estan definidas
// SITE_AUTH_ADMIN_USER/PASSWORD se usan las antiguas SITE_AUTH_USER/PASSWORD
// como credenciales de admin (asi no hace falta recrearlas en Vercel).
// Si no hay ningun usuario configurado, se deja pasar sin bloquear (para no
// dejar la app inaccesible por un despliegue mal configurado), pero eso solo
// deberia pasar antes de configurarlas.
type LoginRole = 'admin' | 'colab';

function resolveRole(request: NextRequest): LoginRole | 'open' | null {
      const adminUser = process.env.SITE_AUTH_ADMIN_USER || process.env.SITE_AUTH_USER;
      const adminPassword = process.env.SITE_AUTH_ADMIN_PASSWORD || process.env.SITE_AUTH_PASSWORD;
      const colabUser = process.env.SITE_AUTH_COLAB_USER;
      const colabPassword = process.env.SITE_AUTH_COLAB_PASSWORD;

  const hasAdmin = Boolean(adminUser && adminPassword);
      const hasColab = Boolean(colabUser && colabPassword);

  if (!hasAdmin && !hasColab) {
          return 'open';
  }

  const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Basic ')) {
              return null;
      }

  const encoded = authHeader.slice('Basic '.length);
      let decoded: string;
      try {
              decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      } catch {
              return null;
      }

  const separatorIndex = decoded.indexOf(':');
      if (separatorIndex === -1) {
              return null;
      }
      const user = decoded.slice(0, separatorIndex);
      const password = decoded.slice(separatorIndex + 1);

  if (hasAdmin && user === adminUser && password === adminPassword) {
          return 'admin';
  }
      if (hasColab && user === colabUser && password === colabPassword) {
              return 'colab';
      }
      return null;
}

export function proxy(request: NextRequest) {
  // Manejo de cierre de sesión explícito: si la URL incluye ?logout=true o /api/logout,
  // se elimina la cookie y se responde 401 Unauthorized con WWW-Authenticate para que
  // el navegador borre las credenciales en caché y vuelva a pedir el diálogo de login.
  if (request.nextUrl.searchParams.has('logout') || request.nextUrl.pathname === '/api/logout') {
    const response = new NextResponse('Sesión cerrada. Por favor ingrese sus credenciales nuevamente.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Bistro BI", charset="UTF-8"',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
    response.cookies.delete('login_role');
    return response;
  }

  const role = resolveRole(request);

  if (role === 'open') {
    return NextResponse.next();
  }

  if (role === 'admin' || role === 'colab') {
    const response = NextResponse.next();
    // Cookie legible por el cliente (no HttpOnly) para que la app React
    // sepa que identidad entro y pueda restringir la navegacion de "colab"
    // a Ventas y Proveedores. No reemplaza la Basic Auth: solo la
    // complementa del lado del cliente.
    response.cookies.set({
      name: 'login_role',
      value: role,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return new NextResponse('Autenticacion requerida.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Bistro BI", charset="UTF-8"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export const config = {
      matcher: [
              '/((?!_next/static|_next/image|favicon.ico|cantina-pink-logo.png).*)',
            ],
};
