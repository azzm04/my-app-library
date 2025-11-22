// types/buku.ts
export interface Buku {
  id: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: number;
  deskripsi: string | null;
  cover: string | null;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
  };
  link_eksternal?: string | null; 
}

export interface Category {
  id: string;
  name: string;
}
