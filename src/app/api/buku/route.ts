import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { checkAdminRole } from "@/lib/auth-server"; // Import helper

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("books")
      .select(
        `
        id, judul, penulis, penerbit, tahun, deskripsi, cover, category_id, link_eksternal,
        categories ( id, name )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // --- 1. CEK OTORISASI ADMIN ---
    const authHeader = request.headers.get("Authorization");
    const { isAdmin, error: authError } = await checkAdminRole(authHeader);

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            authError || "Forbidden: Hanya Admin yang boleh menambah buku.",
        },
        { status: 403 } // 403 Forbidden
      );
    }
    // -----------------------------

    const body = await request.json();
    const {
      judul,
      penulis,
      penerbit,
      tahun,
      deskripsi,
      cover,
      category_name,
      link_eksternal,
    } = body;

    // ... (Sisa kode validasi & insert sama persis seperti sebelumnya) ...
    // ... Copy paste logika insert Anda di sini ...

    // Validate required fields
    if (!judul || !penulis || !penerbit || !tahun || !category_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ... Logika Kategori & Insert Buku ...
    let categoryId;
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category_name)
      .single();
    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const { data: newCategory, error: createCatError } = await supabase
        .from("categories")
        .insert({ name: category_name })
        .select()
        .single();
      if (createCatError) throw createCatError;
      categoryId = newCategory.id;
    }

    const { data, error } = await supabase
      .from("books")
      .insert({
        judul,
        penulis,
        penerbit,
        tahun: parseInt(tahun),
        deskripsi: deskripsi || null,
        cover: cover || null,
        link_eksternal: link_eksternal || null,
        category_id: categoryId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/fiksi");
    revalidatePath("/nonfiksi");

    return NextResponse.json(
      { success: true, message: "Buku berhasil ditambahkan", data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Create book error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization", // Tambahkan Authorization
    },
  });
}
