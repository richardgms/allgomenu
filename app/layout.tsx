import './globals.css'
import { Inter, Nunito } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito'
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
      <body className={`${inter.className} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  )
} 