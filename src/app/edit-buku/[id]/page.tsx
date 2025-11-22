// app/edit-buku/[id]/page.tsx
import { BukuAPI } from "@/lib/api/buku";
import { notFound } from "next/navigation";
import EditBukuClient from "./EditBukuClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const buku = await BukuAPI.getBukuById(params.id);

    if (!buku) {
      return {
        title: 'Buku Tidak Ditemukan',
      };
    }

    return {
      title: `Edit ${buku.judul}`,
      description: `Edit detail buku ${buku.judul}`,
    };
  } catch (error) {
    return {
      title: 'Error',
    };
  }
}

export default async function EditBukuPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    console.log('📖 Fetching book for edit, ID:', params.id);
    const buku = await BukuAPI.getBukuById(params.id);

    if (!buku) {
      console.error('❌ Book not found:', params.id);
      notFound();
    }

    console.log('✅ Book found:', buku.judul);
    return <EditBukuClient buku={buku} />;
  } catch (error) {
    console.error('❌ Error loading book:', error);
    notFound();
  }
}