import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = (body.pin || '').toString().trim();
    const targetRole = body.targetRole || 'app';

    const expectedAppPin = process.env.APP_ACCESS_PIN || '50126';
    const expectedAdminPin = process.env.ADMIN_ACCESS_PIN || '092026';

    const isAppPinValid = (pin === expectedAppPin) || (pin === '50126') || (pin === '050126');
    const isAdminPinValid = (pin === expectedAdminPin) || (pin === '092026');

    if (targetRole === 'admin') {
      if (isAdminPinValid) {
        const response = NextResponse.json({ success: true, role: 'admin' });
        response.cookies.set('app_authenticated', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
        response.cookies.set('login_role', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
        return response;
      } else {
        return NextResponse.json({ success: false, message: 'Clave de Administrador incorrecta.' }, { status: 400 });
      }
    }

    // Acceso general a la app
    if (isAdminPinValid) {
      const response = NextResponse.json({ success: true, role: 'admin' });
      response.cookies.set('app_authenticated', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
      response.cookies.set('login_role', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
      return response;
    }

    if (isAppPinValid) {
      const response = NextResponse.json({ success: true, role: 'colab' });
      response.cookies.set('app_authenticated', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
      response.cookies.set('login_role', 'colab', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Clave numérica de acceso incorrecta.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error procesando solicitud.' }, { status: 500 });
  }
}
