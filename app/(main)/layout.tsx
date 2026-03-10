/**
 * Layout for protected routes under (main).
 * Auth is enforced by middleware; this layout wraps all protected pages.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
