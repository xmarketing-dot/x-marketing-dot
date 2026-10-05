import { redirect } from 'next/navigation';

export default function DuyuruBariRedirectPage() {
  redirect('/bms-secure-portal/site-yonetimi?tab=duyuru');
}
