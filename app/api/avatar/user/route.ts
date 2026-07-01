import { NextResponse } from "next/server";


import dbConnect from "../../../../lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const mod = await import("../../../../models/User");
    const User = mod.default || mod;

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const avatarConfig = (user as any)?.avatarConfig ?? null;
    return NextResponse.json({ success: true, data: avatarConfig }, { status: 200 });
  } catch (err: any) {
    console.error("/api/avatar/user error", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
