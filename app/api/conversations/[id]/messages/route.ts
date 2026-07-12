import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '';

function backendUrl(path: string) {
  return `${BACKEND.replace(/\/$/, '')}/api${path.startsWith('/') ? path : `/${path}`}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get('authorization') || '';
    const url = backendUrl(`/conversations/${id}/messages${req.url.includes('?') ? `?${req.url.split('?')[1]}` : ''}`);
    const res = await fetch(url, { headers: { Authorization: auth } });
    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy error' }, { status: 500 });
  }
}
