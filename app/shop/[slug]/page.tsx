import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import ShopClient from "./ShopClient";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: seller, error: sellerError } = await supabase
    .from("profiles")
    .select("*")
    .eq("shop_slug", slug)
    .single();

  if (sellerError || !seller) notFound();

  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("*")
    .eq("seller_id", seller.id);

  if (booksError) {
    console.error("Error fetching books:", booksError);
  }

  return <ShopClient profile={seller} books={books || []} />;
}
