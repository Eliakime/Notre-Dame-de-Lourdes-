import Link from 'next/link';
import Image from 'next/image';
export function Brand() {
 return <Link href="/" className="brand" aria-label="Notre Dame de Lourdes, accueil"><Image className="brand-logo" src="/images/logo.webp" width={56} height={40} alt="" unoptimized/><span>NOTRE DAME<span className="brand-sub">DE LOURDES <i>•</i> DASSA-ZOUMÈ</span></span></Link>;
}
