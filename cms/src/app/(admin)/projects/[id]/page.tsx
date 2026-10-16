import { Suspense } from "react";

import { ProjectEditor } from "@/components/modules/ProjectEditor";
import { Loading } from "@/components/ui/Layout";

// Client-rendered editor; "new" is prerendered and other ids render on demand.
export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function ProjectEditPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectEditor />
    </Suspense>
  );
}
