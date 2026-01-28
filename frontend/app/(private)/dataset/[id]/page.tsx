type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DatasetDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1>Dataset ID: {id}</h1>
    </div>
  );
}
