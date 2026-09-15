import type { Metadata } from 'next';
import './globals.css';
import './experience.css';
import { ScrollProgress } from '../components/Motion';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { whatsapp } from '../lib/formations';

export const metadata: Metadata = {
  title: 'Notre Dame de Lourdes — Apprendre un métier. Construire son avenir.',
  description: 'Lycée technique et centre de formation professionnelle à Dassa-Zoumè. Découvrez nos filières et préparez votre préinscription.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-scroll-behavior="smooth"><body><ScrollProgress/>{children}<a className="whatsapp-float" href={whatsapp} aria-label="Contacter le secrétariat sur WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon size={26}/><span className="whatsapp-tooltip">Une question ? Parlons-en.</span></a></body></html>;
}
