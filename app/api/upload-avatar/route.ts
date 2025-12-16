import { NextResponse } from "next/server";
import { uploadAvatarAction } from "@/actions/profile-actions";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await uploadAvatarAction(formData as FormData);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: result?.url || null });
  } catch (err: any) {
    console.error("API upload-avatar error:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
