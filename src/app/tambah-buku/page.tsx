// app/tambah-buku/page.tsx
import TambahBukuClient from "./TambahBukuClient";

export const metadata = {
  title: 'Tambah Buku Baru',
  description: 'Bagikan buku favoritmu dengan komunitas',
};

export default function TambahBukuPage() {
  return <TambahBukuClient />;
}