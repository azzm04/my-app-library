// app/api/buku/[id]/route.ts (Update existing file)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Existing code (keep as is)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update book (NEW)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Update book API called for ID:', params.id);

    const body = await request.json();
    console.log('📝 Request body:', body);

    const { judul, penulis, penerbit, tahun, deskripsi, cover, category_name } = body;

    // Validate required fields
    if (!judul || !penulis || !penerbit || !tahun) {
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

    // Update book
    console.log('💾 Updating book...');
    const { data, error } = await supabase
      .from('books')
      .update({
        judul,
        penulis,
        penerbit,
        tahun: parseInt(tahun),
        deskripsi: deskripsi || null,
        cover: cover || null,
        category_id: category.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
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
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Book updated:', data);

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
      data,
    });
  } catch (error: any) {
    console.error('❌ Update book error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Existing code (keep if you have it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optional: Get book first to delete cover from storage
    const { data: book } = await supabase
      .from('books')
      .select('cover')
      .eq('id', params.id)
      .single();

    // Delete book from database
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Optional: Delete cover from storage if exists
    if (book?.cover && book.cover.includes('book-covers')) {
      const fileName = book.cover.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('book-covers')
          .remove([fileName]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}