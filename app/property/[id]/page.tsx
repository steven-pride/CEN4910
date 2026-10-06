import { notFound } from 'next/navigation';
import properties from "@/data/mockProperties";
import { Heading } from "@/components/ui/heading";

interface PageProps {
  params: { id: string };
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = properties.find((a) => a.id === id);

  if (!property) notFound();

  return (
    <Heading level={1}>{property.name}</Heading>
  );
}