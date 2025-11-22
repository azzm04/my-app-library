import type { Buku } from "@/types/buku";
import { supabase } from "@/lib/supabase";

export class BukuAPI {
  /**
   * Fetch semua buku dengan manual join categories
   */
  static async getAllBuku(): Promise<Buku[]> {
    try {
      // Step 1: Fetch semua books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (booksError) {
        console.error("Supabase error getting books:", booksError);
        return [];
      }

      if (!booksData || booksData.length === 0) {
        console.log("No books found");
        return [];
      }

      // Step 2: Fetch semua categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      if (categoriesError) {
        console.error("Supabase error getting categories:", categoriesError);
      }

      // Create a map of categories for quick lookup
      const categoriesMap = new Map(
        (categoriesData || []).map((cat) => [cat.id, cat])
      );

      // Step 3: Map books dengan category
      const books: Buku[] = booksData.map((book) => {
        const category = book.category_id
          ? categoriesMap.get(book.category_id)
          : undefined;

        return {
          id: book.id,
          judul: book.judul,
          penulis: book.penulis,
          penerbit: book.penerbit,
          tahun: book.tahun,
          deskripsi: book.deskripsi,
          cover: book.cover,
          category_id: book.category_id,
          // Tambahkan link_eksternal di sini
          link_eksternal: book.link_eksternal,
          category: category
            ? {
                id: category.id,
                name: category.name,
              }
            : undefined,
        };
      });

      return books;
    } catch (err) {
      console.error("Error fetching all books from Supabase:", err);
      return [];
    }
  }

  /**
   * Fetch buku fiksi
   */
  static async getBukuFiksi(): Promise<Buku[]> {
    try {
      const all = await this.getAllBuku();
      return all.filter((b) => {
        if (!b.category?.name) return false;
        return b.category.name.toLowerCase().trim() === "fiksi";
      });
    } catch (err) {
      console.error("Error fetching fiction books:", err);
      return [];
    }
  }

  /**
   * Fetch buku non-fiksi
   */
  static async getBukuNonFiksi(): Promise<Buku[]> {
    try {
      const all = await this.getAllBuku();
      return all.filter((b) => {
        if (!b.category?.name) return false;
        const name = b.category.name.toLowerCase().trim();
        return name.includes("non") && name.includes("fiksi");
      });
    } catch (err) {
      console.error("Error fetching non-fiction books:", err);
      return [];
    }
  }

  /**
   * Fetch buku by ID (OPTIMIZED)
   * Mengambil langsung 1 data buku tanpa meload semua data
   */
  static async getBukuById(id: string): Promise<Buku | null> {
    try {
      // 1. Fetch single book by ID
      const { data: book, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !book) {
        console.error("Book not found or error:", error);
        return null;
      }

      // 2. Fetch category if exists
      let category = undefined;
      if (book.category_id) {
        const { data: catData } = await supabase
          .from("categories")
          .select("*")
          .eq("id", book.category_id)
          .single();
        
        if (catData) {
          category = { id: catData.id, name: catData.name };
        }
      }

      // 3. Return combined data
      return {
        id: book.id,
        judul: book.judul,
        penulis: book.penulis,
        penerbit: book.penerbit,
        tahun: book.tahun,
        deskripsi: book.deskripsi,
        cover: book.cover,
        category_id: book.category_id,
        // PENTING: Tambahkan ini agar muncul di halaman edit/detail
        link_eksternal: book.link_eksternal,
        category: category,
      };

    } catch (err) {
      console.error("Error fetching book by id from Supabase:", err);
      return null;
    }
  }

  /**
   * Fetch buku terkait berdasarkan penulis yang sama
   */
  static async getRelatedBuku(
    bukuId: string,
    penulis: string
  ): Promise<Buku[]> {
    try {
      // Menggunakan query spesifik untuk related books agar lebih efisien
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .ilike('penulis', penulis) // ilike = case insensitive
        .neq('id', bukuId)
        .limit(4);

      if (!booksData) return [];

      // Sederhanakan return karena related books biasanya hanya butuh cover/judul
      return booksData.map(b => ({
        id: b.id,
        judul: b.judul,
        penulis: b.penulis,
        penerbit: b.penerbit,
        tahun: b.tahun,
        deskripsi: b.deskripsi,
        cover: b.cover,
        category_id: b.category_id,
        link_eksternal: b.link_eksternal,
      })) as Buku[];

    } catch (error) {
      console.error("Error fetching related buku:", error);
      return [];
    }
  }

  /**
   * Search buku berdasarkan query
   */
  static async searchBuku(query: string): Promise<Buku[]> {
    try {
      const allBuku = await this.getAllBuku();
      const lowercaseQuery = query.toLowerCase();

      return allBuku.filter(
        (buku) =>
          buku.judul.toLowerCase().includes(lowercaseQuery) ||
          buku.penulis.toLowerCase().includes(lowercaseQuery) ||
          buku.penerbit.toLowerCase().includes(lowercaseQuery) ||
          buku.deskripsi?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error("Error searching buku:", error);
      return [];
    }
  }
}