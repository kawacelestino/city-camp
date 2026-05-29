import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getQuartos() {
  if (!supabase) return []
  const { data } = await supabase.from('quartos').select('*').eq('ativo', true)
  return data || []
}

async function getPromocoes() {
  if (!supabase) return []
  const { data } = await supabase
    .from('promocoes')
    .select('*')
    .eq('ativo', true)
    .gte('data_fim', new Date().toISOString().split('T')[0])
  return data || []
}

export default async function Home() {
  const quartos = await getQuartos()
  const promocoes = await getPromocoes()

  return (
    <main style={{ fontFamily: "sans-serif", minHeight: '100vh', background: '#F9F5EE' }}>
      <header style={{ background: '#1A5276', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#D4AC0D', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 700, margin: 0 }}>City Camp</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Palheta Azul</p>
        </div>
        <Link href="/admin" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Área Admin</Link>
      </header>

      <section style={{ background: '#1A5276', padding: '48px 32px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#D4AC0D', color: '#3D2B00', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Reserve Online
        </div>
        <h2 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.2 }}>
          Sua estadia perfeita<br />começa aqui
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: '0 auto 32px', maxWidth: '440px' }}>
          Reserve seu quarto com facilidade e segurança. Confirmação imediata!
        </p>
      </section>

      {promocoes.length > 0 && (
        <section style={{ padding: '0 32px', marginTop: '-20px', marginBottom: '32px' }}>
          {promocoes.map((p: any) => (
            <div key={p.id} style={{ background: '#1D6A3A', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>🏷️</span>
              <div>
                <h3 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '16px', margin: '0 0 4px' }}>{p.titulo}</h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>{p.descricao}</p>
              </div>
              <div style={{ marginLeft: 'auto', background: '#D4AC0D', color: '#3D2B00', borderRadius: '10px', padding: '6px 16px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                -{p.desconto_percentual}% OFF
              </div>
            </div>
          ))}
        </section>
      )}

      <section style={{ padding: '0 32px 48px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: '#1A5276' }}>Nossos quartos</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Escolha o quarto ideal para sua estadia</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {quartos.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid #e0d8c8', padding: '28px', color: '#666', gridColumn: '1 / -1' }}>
              Os quartos serao exibidos aqui quando o Supabase estiver configurado.
            </div>
          )}
          {quartos.map((q: any) => (
            <div key={q.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid #e0d8c8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '180px', background: '#1A5276', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                {q.fotos && q.fotos.length > 0 ? <img src={q.fotos[0]} alt={q.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏨'}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#1A5276' }}>{q.nome}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: 1.5 }}>{q.descricao}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {q.comodidades?.slice(0, 3).map((c: string) => (
                    <span key={c} style={{ background: '#F5E6C8', color: '#7D5A00', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#1A5276' }}>R$ {q.preco.toFixed(2).replace('.', ',')}</span>
                    <span style={{ color: '#999', fontSize: '12px' }}>/noite</span>
                  </div>
                  <Link href={`/quarto/${q.id}`} style={{ background: '#1A5276', color: '#fff', padding: '10px 22px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                    Reservar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: '#1A5276', padding: '24px 32px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {[{ icon: '🔒', text: 'Pagamento 100% seguro' }, { icon: '✅', text: 'Confirmação imediata' }, { icon: '💬', text: 'Suporte via WhatsApp' }].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            <span>{item.icon}</span><span>{item.text}</span>
          </div>
        ))}
      </footer>
    </main>
  )
}
