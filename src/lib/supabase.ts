// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey , {
  auth: {
    persistSession: false,
  },
});

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          judul: string;
          penulis: string;
          penerbit: string;
          tahun: number;
          deskripsi: string | null;
          cover: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
      };
    };
  };
};