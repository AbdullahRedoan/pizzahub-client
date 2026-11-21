import { Suspense } from "react";
import { ItemDetailsView } from "@/components/menu/item-details-view";
import { ItemDetailsSkeleton } from "@/components/menu/menu-skeletons";

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ItemDetailsSkeleton />}>
      <ItemDetailsResolver params={params} />
    </Suspense>
  );
}

async function ItemDetailsResolver({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetailsView id={id} />;
}
