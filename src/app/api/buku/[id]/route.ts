import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Get Single Book
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
        link_eksternal,  // PENTING: Pastikan ini ada
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

// PUT - Update Book
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Update book API called for ID:', params.id);

    const body = await request.json();
    // Ambil link_eksternal dari body
    const { judul, penulis, penerbit, tahun, deskripsi, cover, category_name, link_eksternal } = body;

    // Validate required fields
    if (!judul || !penulis || !penerbit || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get category ID by name
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category_name)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Update book
    const { data, error } = await supabase
      .from('books')
      .update({
        judul,
        penulis,
        penerbit,
        tahun: parseInt(tahun),
        deskripsi: deskripsi || null,
        cover: cover || null,
        link_eksternal: link_eksternal || null, // PENTING: Masukkan ini ke database
        category_id: category.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // REVALIDATE CACHE: Agar data di halaman depan & detail langsung berubah
    revalidatePath('/');
    revalidatePath('/fiksi');
    revalidatePath('/nonfiksi');
    revalidatePath(`/buku/${params.id}`);

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

// DELETE - Delete Book
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get book first to identify cover image
    const { data: book } = await supabase
      .from('books')
      .select('cover')
      .eq('id', params.id)
      .single();

    // 2. Delete book from database
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // 3. Delete cover from storage if exists (Cleanup)
    if (book?.cover && book.cover.includes('book-covers')) {
      const fileName = book.cover.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('book-covers')
          .remove([fileName]);
      }
    }

    // 4. REVALIDATE CACHE: Penting agar buku hilang dari list
    revalidatePath('/');
    revalidatePath('/fiksi');
    revalidatePath('/nonfiksi');

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