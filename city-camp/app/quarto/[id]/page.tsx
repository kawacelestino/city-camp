'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function QuartoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quarto, setQuarto] = useState<any>(null)
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [bloqueios, setBloqueios] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    supabase.from('quartos').select('*').eq('id', id).single().then(({ data }) => setQuarto(data))
    supabase.from('bloqueios').select('*').eq('quarto_id', id).then(({ data }) => setBloqueios(data || []))
    supabase.from('reservas').select('*').eq('quarto_id', id).in('status', ['confirmada', 'paga']).then(({ data }) => setReservas(data || []))
  }, [id])

  const isDiaBloqueado = (data: string) => {
    return bloqueios.some(b => data >= b.data_inicio && data <= b.data_fim) ||
      reservas.some(r => data >= r.data_checkin && data < r.data_checkout)
  }

  const handleReservar = () => {
    if (!checkin || !checkout) return setErro('Selecione as datas de check-in e check-out')
    if (checkin >= checkout) return setErro('Check-out deve ser após o check-in')
    let d = new Date(checkin)
    const fim = new Date(checkout)
    while (d < fim) {
      const s = d.toISOString().split('T')[0]
      if (isDiaBloqueado(s)) return setErro('Uma ou mais datas selecionadas não estão disponíveis')
      d.setDate(d.getDate() + 1)
    }
    setErro('')
    router.push(`/reservar?quarto=${id}&checkin=${checkin}&checkout=${checkout}`)
  }

  if (!quarto) return <div style={{ padding: 40, textAlign: 'center', color: '#1A5276', fontFamily: 'sans-serif' }}>Carregando...</div>

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9F5EE' }}>
      <header style={{ background: '#1A5276', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>← Voltar</Link>
        <h1 style={{ color: '#D4AC0D', fontFamily: 'Georgia, serif', fontSize: '20px', margin: 0 }}>City Camp</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: '#1A5276', height: '260px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', marginBottom: '28px' }}>
          {quarto.fotos?.length > 0 ? <img src={quarto.fotos[0]} alt={quarto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} /> : '🏨'}
        </div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#1A5276', marginBottom: '8px' }}>{quarto.nome}</h2>
        <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>{quarto.descricao}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {quarto.comodidades?.map((c: string) => (
            <span key={c} style={{ background: '#F5E6C8', color: '#7D5A00', fontSize: '13px', padding: '5px 14px', borderRadius: '20px', fontWeight: 500 }}>{c}</span>
          ))}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: '16px', padding: '28px' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '20px', fontSize: '20px' }}>Verificar disponibilidade</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Check-in</label>
              <input type="date" value={checkin} min={hoje} onChange={e => setCheckin(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#333' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Check-out</label>
              <input type="date" value={checkout} min={checkin || hoje} onChange={e => setCheckout(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#333' }} />
            </div>
          </div>
          {erro && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>⚠️ {erro}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#1A5276' }}>R$ {quarto.preco.toFixed(2).replace('.', ',')}</span>
              <span style={{ color: '#999', fontSize: '13px' }}>/noite</span>
            </div>
            <button onClick={handleReservar}
              style={{ background: '#D4AC0D', color: '#3D2B00', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Reservar agora →
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
