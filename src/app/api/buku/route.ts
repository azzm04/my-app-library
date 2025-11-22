// app/api/buku/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        )
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
    console.log('📚 Create book API called');

    const body = await request.json();
    console.log('📝 Request body:', body);

    const { judul, penulis, penerbit, tahun, deskripsi, cover, category_name } = body;

    // Validate required fields
    if (!judul || !penulis || !penerbit || !tahun || !category_name) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get category ID by name
    console.log('🔍 Finding category:', category_name);
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category_name)
      .single();

    if (categoryError || !category) {
      console.error('❌ Category not found:', category_name);
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    console.log('✅ Category found:', category.id);

    // Insert new book
    console.log('💾 Inserting book...');
    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          judul,
          penulis,
          penerbit,
          tahun: parseInt(tahun),
          deskripsi: deskripsi || null,
          cover: cover || null,
          category_id: category.id,
        },
      ])
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
        )
      `)
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }

    console.log('✅ Book created:', data);

    return NextResponse.json({
      success: true,
      message: 'Book created successfully',
      data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create book error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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