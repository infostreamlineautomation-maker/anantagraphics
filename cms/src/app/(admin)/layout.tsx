import { AuthGate } from "@/components/AuthGate";


/** Every CMS page except /login lives in this group and requires a session. */
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return <AuthGate>{children}</AuthGate>;
}
