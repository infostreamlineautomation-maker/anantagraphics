import { PageEditor } from "@/components/modules/PageEditor";


export function generateStaticParams() {
  return ["home", "about", "our-work", "contact"].map((page) => ({ page }));
}

export default function EditPagePage() {
  return <PageEditor />;
}
