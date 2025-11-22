import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Fetch all books
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('books')
      .select(`
        id,
        judul,
        penulis,
        penerbit,
        tahun,
        deskripsi,
        cover,
        category_id,
        categories (
          id,
          name
        ),
        link_eksternal
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      data: data || [],
    });
  } catch (error: any) {
    console.error('❌ GET books error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judul, penulis, penerbit, tahun, deskripsi, cover, category_name, link_eksternal } = body;

    // Validasi field wajib
    if (!judul || !penulis || !penerbit || !tahun || !category_name) {
      return NextResponse.json(
        { success: false, error: 'Mohon lengkapi field wajib (*)' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. LOGIKA KATEGORI (ROBUST)
    // Cari dulu apakah kategori sudah ada
    let categoryId;
    
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category_name)
      .single();

    if (existingCategory) {
      // Jika ada, gunakan ID-nya
      categoryId = existingCategory.id;
    } else {
      // Jika tidak ada, BUAT BARU (Ini mencegah error jika kategori baru ditambah di frontend)
      const { data: newCategory, error: createCatError } = await supabase
        .from('categories')
        .insert({ name: category_name })
        .select()
        .single();
      
      if (createCatError) {
        console.error('❌ Error creating category:', createCatError);
        return NextResponse.json(
          { success: false, error: 'Gagal memproses kategori' },
          { status: 500 }
        );
      }
      categoryId = newCategory.id;
    }

    // 2. Insert Buku Baru
    const { data, error } = await supabase
      .from('books')
      .insert({
        judul,
        penulis,
        penerbit,
        tahun: parseInt(tahun),
        deskripsi: deskripsi || null,
        cover: cover || null,
        link_eksternal: link_eksternal || null, // Field Link Eksternal
        category_id: categoryId,
        created_at: new Date().toISOString(),
      })
      .select(`
        id,
        judul,
        penulis,
        penerbit,
        tahun,
        deskripsi,
        cover,
        category_id,
        categories (
          id,
          name
        ),
        link_eksternal
      `)
      .single();

    if (error) throw error;

    // 3. Revalidate Cache
    revalidatePath('/');
    revalidatePath('/fiksi');
    revalidatePath('/nonfiksi');

    return NextResponse.json({
      success: true,
      message: 'Buku berhasil ditambahkan',
      data,
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create book error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}