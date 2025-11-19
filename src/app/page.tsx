// app/page.tsx
import { BukuAPI } from "@/lib/api/buku";
import ClientHomePage from "./ClientHomePage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch semua buku dari Supabase
  const allBuku = await BukuAPI.getAllBuku();

  // Filter buku berdasarkan kategori
  const bukuFiksi = allBuku.filter((b) => b.category?.name === "Fiksi");
  const bukuNonFiksi = allBuku.filter(
    (b) =>
      b.category?.name === "Non-Fiksi" ||
      b.category?.name === "Non Fiksi" ||
      b.category?.name === "Nonfiksi"
  );

    const bukuTerpilih = [...bukuFiksi.slice(0, 2), ...bukuNonFiksi.slice(0, 2)];

  return (
    <ClientHomePage
      bukuTerpilih={bukuTerpilih}
      totalBuku={allBuku.length}
      totalFiksi={bukuFiksi.length}
      totalNonFiksi={bukuNonFiksi.length}
    />
  );
}
