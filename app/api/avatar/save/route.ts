import { NextResponse } from "next/server";


import dbConnect from "../../../../lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
    }

    const mod = await import("../../../../models/User");
    const User = mod.default || mod;

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { avatarConfig: body } },
      { new: true, upsert: true }
    ).lean();

    const avatarConfig = (updated as any)?.avatarConfig ?? null;
    return NextResponse.json({ success: true, data: avatarConfig }, { status: 200 });
  } catch (err: any) {
    console.error("/api/avatar/save error", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
