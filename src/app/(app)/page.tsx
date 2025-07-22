
import { redirect } from 'next/navigation'

export default function Page() {
  // This page is protected by the layout, no need for redirect here.
  // The root page will handle auth checks.
  redirect('/');
}
