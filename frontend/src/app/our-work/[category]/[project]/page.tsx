import { permanentRedirect } from "next/navigation";
import { projectParams } from "@/lib/params";

export const generateStaticParams = projectParams;

export const instant = false;

type Props = PageProps<"/our-work/[category]/[project]">;

export default async function ProjectPage({ params }: Props) {
  const { category } = await params;
  // Per client specification: no separate project page.
  // Redirect old project URLs directly to the category work grid.
  permanentRedirect(`/our-work/${category}`);
}
