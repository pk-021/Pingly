
import { redirect } from 'next/navigation'

export default function Page() {
  // This page is now redundant as the main auth check and content
  // are handled by the root page.tsx. We redirect to prevent any
  // direct access or confusion.
  redirect('/');
}
