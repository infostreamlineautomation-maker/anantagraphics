"use client";

import { LinkButton } from "@/components/ui/Button";
import { PageHeader, Panel } from "@/components/ui/Layout";

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Services & Projects"
        back={{ href: "/projects", label: "Projects" }}
      />
      <div className="max-w-2xl">
        <Panel title="Services are now managed under Projects">
          <p className="text-muted leading-relaxed">
            Services and Projects are now unified as one. Homepage carousel cards, category work grids,
            and detail pages are all managed together directly from <strong>Projects</strong>.
          </p>
          <p className="mt-3 text-sm text-muted">
            To display any project in the homepage carousel, simply edit the project and turn on{" "}
            <span className="font-semibold text-ink">“Feature on homepage carousel”</span>.
          </p>
          <div className="mt-6">
            <LinkButton href="/projects">
              Go to Projects →
            </LinkButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}
