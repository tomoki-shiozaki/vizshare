import { HomePageClient } from "@/features/home/components/HomePageClient";

import { fetchPublicDatasetListServer } from "@/features/datasets/public/list/api/fetchPublicDatasetServer";

export default async function HomePage() {
  const publicData = await fetchPublicDatasetListServer();

  return <HomePageClient publicData={publicData} />;
}
