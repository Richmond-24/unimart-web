import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '';

function backendUrl(path: string) {
  return `${BACKEND.replace(/\/$/, '')}/api${path.startsWith('/') ? path : `/${path}`}`;
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const res = await fetch(backendUrl('/conversations'), { headers: { Authorization: auth } });
    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const body = await req.json();
    const res = await fetch(backendUrl('/conversations'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: auth }, body: JSON.stringify(body) });
    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy error' }, { status: 500 });
  }
}
