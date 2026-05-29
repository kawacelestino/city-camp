'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ReservarForm() {
  const params = useSearchParams()
  const router = useRouter()
  const quartoId = params.get('quarto')
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''

  const [quarto, setQuarto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', observacoes: '' })

  useEffect(() => {
    if (quartoId && supabase) supabase.from('quartos').select('*').eq('id', quartoId).single().then(({ data }) => setQuarto(data))
  }, [quartoId])

  const noites = checkin && checkout
    ? Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const total = quarto ? quarto.preco * noites : 0

  const handleSubmit = async () => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!form.nome || !form.email || !form.telefone) return alert('Preencha todos os campos obrigatórios')
    setLoading(true)
    const { data, error } = await supabase.from('reservas').insert({
      quarto_id: quartoId,
      cliente_nome: form.nome,
      cliente_email: form.email,
      cliente_telefone: form.telefone,
      data_checkin: checkin,
      data_checkout: checkout,
      valor_total: total,
      status: 'confirmada',
      observacoes: form.observacoes
    }).select().single()

    if (error) { alert('Erro ao fazer reserva: ' + error.message); setLoading(false); return }

    // Notificar WhatsApp
    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserva: data, quarto: quarto, cliente: form })
    })

    router.push(`/confirmacao?id=${data.id}`)
  }

  if (!supabase) return <div style={{ padding: 40, textAlign: 'center', color: '#1A5276', fontFamily: 'sans-serif' }}>Supabase nao configurado.</div>
  if (!quarto) return <div style={{ padding: 40, textAlign: 'center', color: '#1A5276', fontFamily: 'sans-serif' }}>Carregando...</div>

  const fmtData = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9F5EE' }}>
      <header style={{ background: '#1A5276', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/quarto/${quartoId}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>← Voltar</Link>
        <h1 style={{ color: '#D4AC0D', fontFamily: 'Georgia, serif', fontSize: '20px', margin: 0 }}>City Camp — Finalizar Reserva</h1>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Formulário */}
        <div>
          <div style={{ background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '20px', fontSize: '20px' }}>Seus dados</h2>
            {[
              { label: 'Nome completo *', key: 'nome', type: 'text', placeholder: 'João da Silva' },
              { label: 'E-mail *', key: 'email', type: 'email', placeholder: 'joao@email.com' },
              { label: 'WhatsApp *', key: 'telefone', type: 'tel', placeholder: '(65) 99999-9999' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Observações</label>
              <textarea placeholder="Alguma solicitação especial?" value={form.observacoes}
                onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div>
          <div style={{ background: '#fff', border: '0.5px solid #e0d8c8', borderRadius: '16px', padding: '24px', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '16px', fontSize: '18px' }}>Resumo</h3>
            <div style={{ background: '#F9F5EE', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, color: '#1A5276', marginBottom: '4px', fontSize: '15px' }}>{quarto.nome}</p>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Capacidade: {quarto.capacidade} pessoas</p>
            </div>
            {[
              { label: 'Check-in', value: fmtData(checkin) },
              { label: 'Check-out', value: fmtData(checkout) },
              { label: 'Noites', value: `${noites} noite${noites > 1 ? 's' : ''}` },
              { label: 'Valor/noite', value: `R$ ${quarto.preco.toFixed(2).replace('.', ',')}` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#555' }}>
                <span>{item.label}</span><span style={{ fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e0d8c8', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#1A5276' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '22px', color: '#1A5276' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', background: loading ? '#ccc' : '#D4AC0D', color: '#3D2B00', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processando...' : '✅ Confirmar Reserva'}
            </button>
            <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginTop: '10px' }}>🔒 Seus dados estão seguros</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ReservarPage() {
  return <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>}><ReservarForm /></Suspense>
}
