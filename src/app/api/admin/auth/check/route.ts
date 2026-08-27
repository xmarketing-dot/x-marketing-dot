import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bms_admin_auth')?.value;

    if (!token || token !== 'authenticated_superadmin_session_token') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Return strictly boolean auth status without leaking any DB data, emails or user IDs
    return NextResponse.json(
      { authenticated: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
