import { NextRequest, NextResponse } from 'next/server';
import { installed } from '@/src/config/client_secret.json';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const refreshToken = searchParams.get('refreshToken');

    if (!refreshToken) {
        return NextResponse.json({ error: 'No refresh token provided' }, { status: 400 });
    }

    try {
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const payload = new URLSearchParams({
            client_id: installed.client_id,
            client_secret: installed.client_secret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString(),
        });

        if (!response.ok) throw new Error('Failed to refresh access token');

        const tokenData = await response.json();

        const html = `
            <html>
                <body>
                    <script>
                        localStorage.setItem('refreshToken', '${tokenData.refresh_token}');
                        localStorage.setItem('accessToken', '${tokenData.access_token}');
                        window.location.href = '/';
                    </script>
                    <p>Đang chuyển hướng...</p>
                </body>
            </html>
        `;
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
