import './globals.css'
import '/public/styles/theme-overrides.css'
import { Poppins } from 'next/font/google'
import { Providers } from '@/lib/providers'
import '@/lib/console-filter' // Aplicar filtros de console

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'AllGo Menu - Sistema de Delivery',
  description: 'Crie seu sistema de delivery personalizado com integração WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} ${poppins.variable}`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 