'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmacaoContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const [reserva, setReserva] = useState<any>(null)
  const [quarto, setQuarto] = useState<any>(null)

  useEffect(() => {
    if (id) {
      supabase.from('reservas').select('*').eq('id', id).single().then(async ({ data }) => {
        setReserva(data)
        if (data?.quarto_id) {
          const { data: q } = await supabase.from('quartos').select('*').eq('id', data.quarto_id).single()
          setQuarto(q)
        }
      })
    }
  }, [id])

  if (!reserva) return <div style={{ padding: 40, textAlign: 'center', color: '#1A5276', fontFamily: 'sans-serif' }}>Carregando...</div>

  const fmtData = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9F5EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: '20px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '72px', height: '72px', background: '#1D6A3A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px' }}>✅</div>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#1D6A3A', fontSize: '28px', marginBottom: '8px' }}>Reserva Confirmada!</h1>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '28px' }}>
          Enviamos uma confirmação para <strong>{reserva.cliente_email}</strong>
        </p>

        <div style={{ background: '#F9F5EE', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span style={{ color: '#888' }}>Reserva #</span>
            <span style={{ fontWeight: 600, color: '#1A5276', fontSize: '12px' }}>{reserva.id.slice(0, 8).toUpperCase()}</span>
          </div>
          {quarto && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span style={{ color: '#888' }}>Quarto</span>
              <span style={{ fontWeight: 600, color: '#333' }}>{quarto.nome}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span style={{ color: '#888' }}>Check-in</span>
            <span style={{ fontWeight: 600, color: '#333' }}>{fmtData(reserva.data_checkin)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span style={{ color: '#888' }}>Check-out</span>
            <span style={{ fontWeight: 600, color: '#333' }}>{fmtData(reserva.data_checkout)}</span>
          </div>
          <div style={{ borderTop: '1px solid #e0d8c8', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
            <span style={{ fontWeight: 700, color: '#1A5276' }}>Total pago</span>
            <span style={{ fontWeight: 700, color: '#1A5276' }}>R$ {reserva.valor_total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
          📱 A dona da pousada foi notificada e entrará em contato pelo WhatsApp para confirmar os detalhes.
        </p>

        <Link href="/" style={{ display: 'block', background: '#1A5276', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}

export default function ConfirmacaoPage() {
  return <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>}><ConfirmacaoContent /></Suspense>
}
