import { NextResponse } from "next/server";


import dbConnect from "../../../../lib/dbConnect";
import { getServerSession } from "next-auth/next";
// import authOptions from your project auth file if you use it for getServerSession
import { authOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const mod = await import("../../../../models/AvatarItem");
    const AvatarItem = mod.default || mod;

    const items = await AvatarItem.find({}).lean();
    const grouped: Record<string, any[]> = {};
    for (const it of items) {
      const cat = it.category || "uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(it);
    }

    return NextResponse.json({ success: true, data: grouped }, { status: 200 });
  } catch (err: any) {
    console.error("/api/avatar/items error", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
