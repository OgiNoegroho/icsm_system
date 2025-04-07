// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabaseAdminClient } from "~/lib/supabase/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password, nama, peran = "Admin_Produksi" } = body;

    // Register with Supabase Auth using admin client
    const { data: authData, error: authError } =
      await supabaseAdminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: nama,
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error: authError?.message || "Failed to create account",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      );
    }

    // Create user in your database
    const user = await prisma.pengguna.create({
      data: {
        auth_id: authData.user.id,
        nama,
        email,
        peran,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to register user",
        code: error.code || "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
