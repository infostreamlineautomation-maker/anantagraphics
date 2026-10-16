import { WorkCategoryEditor } from "@/components/modules/WorkCategoryEditor";

// Client-rendered editor; "new" is prerendered and other ids render on demand.
export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function WorkCategoryEditPage() {
  return <WorkCategoryEditor />;
}
