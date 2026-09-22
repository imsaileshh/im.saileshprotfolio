import { redirect } from 'next/navigation';

export default function HeroEditorPage() {
  redirect('/dashboard/home#hero');
}
