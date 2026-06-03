'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_PASSWORD = 'citycamp2025'

type Reserva = {
  id: string
  cliente_nome: string
  cliente_telefone: string
  data_checkin: string
  data_checkout: string
  valor_total: number
  status: string
  quartos?: { nome: string | null } | null
}

type Quarto = {
  id: string
  nome: string
  descricao: string | null
  preco: number
  capacidade: number
  comodidades: string[] | null
  fotos: string[] | null
  ativo: boolean
}

type QuartoEditavel = {
  id: string
  nome: string
  descricao: string
  preco: string
  capacidade: string
  comodidades: string
  fotos: string
  ativo: boolean
}

type NovoQuarto = {
  nome: string
  descricao: string
  preco: string
  capacidade: string
  comodidades: string
  fotos: string
}

type Promocao = {
  id: string
  titulo: string
  descricao: string | null
  desconto_percentual: number
  data_inicio: string | null
  data_fim: string | null
  ativo: boolean
}

type PromocaoEditavel = {
  id: string
  titulo: string
  descricao: string
  desconto_percentual: string
  data_inicio: string
  data_fim: string
  ativo: boolean
}

export default function AdminPage() {
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [aba, setAba] = useState<'reservas'|'quartos'|'bloqueios'|'promocoes'>('quartos')
  const [bloqueio, setBloqueio] = useState({ quarto_id: '', data_inicio: '', data_fim: '', motivo: '' })
  const [promocao, setPromocao] = useState({ titulo: '', descricao: '', desconto_percentual: '', data_inicio: '', data_fim: '' })
  const [novoQuarto, setNovoQuarto] = useState<NovoQuarto>({ nome: '', descricao: '', preco: '', capacidade: '2', comodidades: '', fotos: '' })
  const [editandoQuarto, setEditandoQuarto] = useState<QuartoEditavel | null>(null)
  const [editandoPromocao, setEditandoPromocao] = useState<PromocaoEditavel | null>(null)
  const [msg, setMsg] = useState('')

  const carregar = async () => {
    if (!supabase) return
    const { data: r } = await supabase.from('reservas').select('*, quartos(nome)').order('created_at', { ascending: false })
    const { data: q } = await supabase.from('quartos').select('*').order('created_at')
    const { data: p } = await supabase.from('promocoes').select('*').order('created_at', { ascending: false })
    setReservas((r || []) as Reserva[])
    setQuartos((q || []) as Quarto[])
    setPromocoes((p || []) as Promocao[])
  }

  const login = () => {
    if (senha === ADMIN_PASSWORD) {
      setLogado(true)
      carregar()
    }
    else alert('Senha incorreta!')
  }

  const cancelarReserva = async (id: string) => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!confirm('Cancelar esta reserva?')) return
    await supabase.from('reservas').update({ status: 'cancelada' }).eq('id', id)
    carregar()
  }

  const salvarBloqueio = async () => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!bloqueio.quarto_id || !bloqueio.data_inicio || !bloqueio.data_fim) return alert('Preencha todos os campos')
    await supabase.from('bloqueios').insert(bloqueio)
    setBloqueio({ quarto_id: '', data_inicio: '', data_fim: '', motivo: '' })
    setMsg('Bloqueio salvo!')
    setTimeout(() => setMsg(''), 3000)
  }

  const salvarPromocao = async () => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!promocao.titulo || !promocao.desconto_percentual) return alert('Preencha todos os campos')
    await supabase.from('promocoes').insert({ ...promocao, desconto_percentual: parseFloat(promocao.desconto_percentual), ativo: true })
    setPromocao({ titulo: '', descricao: '', desconto_percentual: '', data_inicio: '', data_fim: '' })
    setMsg('Promoção criada!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const iniciarEdicaoPromocao = (p: Promocao) => {
    setEditandoPromocao({
      ...p,
      descricao: p.descricao || '',
      desconto_percentual: String(p.desconto_percentual ?? ''),
      data_inicio: p.data_inicio || '',
      data_fim: p.data_fim || '',
      ativo: Boolean(p.ativo),
    })
  }

  const salvarEdicaoPromocao = async () => {
    if (!supabase || !editandoPromocao) return
    if (!editandoPromocao.titulo || !editandoPromocao.desconto_percentual) return alert('Preencha titulo e desconto')

    const { error } = await supabase.from('promocoes').update({
      titulo: editandoPromocao.titulo,
      descricao: editandoPromocao.descricao,
      desconto_percentual: parseFloat(editandoPromocao.desconto_percentual),
      data_inicio: editandoPromocao.data_inicio,
      data_fim: editandoPromocao.data_fim,
      ativo: editandoPromocao.ativo,
    }).eq('id', editandoPromocao.id)

    if (error) return alert('Erro ao salvar promoção: ' + error.message)
    setEditandoPromocao(null)
    setMsg('Promoção atualizada!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const alternarPromocao = async (p: Promocao) => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    const { error } = await supabase.from('promocoes').update({ ativo: !p.ativo }).eq('id', p.id)
    if (error) return alert('Erro ao atualizar promoção: ' + error.message)
    setMsg(p.ativo ? 'Promoção desativada!' : 'Promoção ativada!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const excluirPromocao = async (id: string) => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!confirm('Remover esta promoção?')) return
    const { error } = await supabase.from('promocoes').delete().eq('id', id)
    if (error) return alert('Erro ao remover promoção: ' + error.message)
    if (editandoPromocao?.id === id) setEditandoPromocao(null)
    setMsg('Promoção removida!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const salvarQuarto = async () => {
    if (!supabase) return alert('Supabase nao configurado. Adicione as variaveis de ambiente no Vercel.')
    if (!novoQuarto.nome || !novoQuarto.preco) return alert('Preencha nome e preço')
    await supabase.from('quartos').insert({
      nome: novoQuarto.nome,
      descricao: novoQuarto.descricao,
      preco: parseFloat(novoQuarto.preco),
      capacidade: parseInt(novoQuarto.capacidade),
      comodidades: novoQuarto.comodidades.split(',').map(c => c.trim()).filter(Boolean),
      fotos: novoQuarto.fotos.split('\n').map(f => f.trim()).filter(Boolean),
    })
    setNovoQuarto({ nome: '', descricao: '', preco: '', capacidade: '2', comodidades: '', fotos: '' })
    setMsg('Quarto adicionado!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const iniciarEdicaoQuarto = (q: Quarto) => {
    setEditandoQuarto({
      ...q,
      descricao: q.descricao || '',
      preco: String(q.preco ?? ''),
      capacidade: String(q.capacidade ?? '2'),
      comodidades: (q.comodidades || []).join(', '),
      fotos: (q.fotos || []).join('\n'),
    })
  }

  const salvarEdicaoQuarto = async () => {
    if (!supabase || !editandoQuarto) return
    const { error } = await supabase.from('quartos').update({
      nome: editandoQuarto.nome,
      descricao: editandoQuarto.descricao,
      preco: parseFloat(editandoQuarto.preco),
      capacidade: parseInt(editandoQuarto.capacidade),
      comodidades: editandoQuarto.comodidades.split(',').map((c: string) => c.trim()).filter(Boolean),
      fotos: editandoQuarto.fotos.split('\n').map((f: string) => f.trim()).filter(Boolean),
      ativo: editandoQuarto.ativo,
    }).eq('id', editandoQuarto.id)

    if (error) return alert('Erro ao salvar quarto: ' + error.message)
    setEditandoQuarto(null)
    setMsg('Quarto atualizado!')
    carregar()
    setTimeout(() => setMsg(''), 3000)
  }

  const statusColor: Record<string, string> = { confirmada: '#1D6A3A', pendente: '#D4AC0D', cancelada: '#c0392b', paga: '#1A5276' }
  const fmtData = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600 as const, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }
  const abaStyle = (a: string) => ({
    padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 as const,
    background: aba === a ? '#1A5276' : 'transparent', color: aba === a ? '#fff' : '#555'
  })
  const camposNovoQuarto: Array<{ label: string; key: keyof NovoQuarto; placeholder: string }> = [
    { label: 'Nome do quarto *', key: 'nome', placeholder: 'Ex: SuÃ­te Deluxe' },
    { label: 'PreÃ§o por noite (R$) *', key: 'preco', placeholder: '250.00' },
    { label: 'Capacidade (pessoas)', key: 'capacidade', placeholder: '2' },
    { label: 'Comodidades (separadas por vÃ­rgula)', key: 'comodidades', placeholder: 'Wi-Fi, Ar-cond, TV' },
  ]

  if (!logado) return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 40px', width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '8px' }}>City Camp</h1>
        <p style={{ color: '#888', marginBottom: '28px', fontSize: '14px' }}>Painel da Administração</p>
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ ...inputStyle, marginBottom: '16px' }} />
        <button onClick={login} style={{ width: '100%', background: '#1A5276', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Entrar
        </button>
        <Link href="/" style={{ display: 'block', marginTop: '16px', color: '#aaa', fontSize: '13px', textDecoration: 'none' }}>← Voltar ao site</Link>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F9F5EE' }}>
      <header style={{ background: '#1A5276', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#D4AC0D', fontFamily: 'Georgia, serif', fontSize: '20px', margin: 0 }}>City Camp — Admin</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textDecoration: 'none' }}>Ver site →</Link>
          <button onClick={() => setLogado(false)} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Sair</button>
        </div>
      </header>

      {msg && <div style={{ background: '#1D6A3A', color: '#fff', padding: '12px 32px', fontSize: '14px', textAlign: 'center' }}>✅ {msg}</div>}

      <div style={{ padding: '24px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Reservas', value: reservas.length, color: '#1A5276' },
            { label: 'Confirmadas', value: reservas.filter(r => r.status === 'confirmada' || r.status === 'paga').length, color: '#1D6A3A' },
            { label: 'Pendentes', value: reservas.filter(r => r.status === 'pendente').length, color: '#D4AC0D' },
            { label: 'Quartos', value: quartos.length, color: '#C9A96E' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '0.5px solid #e0d8c8' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#fff', padding: '8px', borderRadius: '12px', border: '0.5px solid #e0d8c8', width: 'fit-content' }}>
          {(['reservas', 'quartos', 'bloqueios', 'promocoes'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)} style={abaStyle(a)}>
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Reservas */}
        {aba === 'reservas' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid #e0d8c8', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9F5EE' }}>
                  {['Cliente', 'Quarto', 'Check-in', 'Check-out', 'Total', 'Status', 'Ação'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservas.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: '0.5px solid #f0ebe0', background: i % 2 === 0 ? '#fff' : '#fdfaf5' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                      <div style={{ fontWeight: 600, color: '#333' }}>{r.cliente_nome}</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>{r.cliente_telefone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{r.quartos?.nome || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{fmtData(r.data_checkin)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{fmtData(r.data_checkout)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1A5276' }}>R$ {r.valor_total.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: statusColor[r.status] + '22', color: statusColor[r.status], padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {r.status !== 'cancelada' && (
                        <button onClick={() => cancelarReserva(r.id)}
                          style={{ background: '#fdf0f0', color: '#c0392b', border: '0.5px solid #f5c6c6', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reservas.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>Nenhuma reserva ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quartos */}
        {aba === 'quartos' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {quartos.map(q => (
                <div key={q.id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '0.5px solid #e0d8c8' }}>
                  {q.fotos?.[0] && (
                    <img src={q.fotos[0]} alt={q.nome} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', fontSize: '16px', margin: '0 0 4px' }}>{q.nome}</h3>
                    <span style={{ background: q.ativo ? '#1D6A3A22' : '#c0392b22', color: q.ativo ? '#1D6A3A' : '#c0392b', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                      {q.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>{q.descricao?.slice(0, 60)}...</p>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A5276' }}>R$ {q.preco.toFixed(2).replace('.', ',')}<span style={{ fontSize: '12px', color: '#aaa', fontWeight: 400 }}>/noite</span></div>
                  <button onClick={() => iniciarEdicaoQuarto(q)} style={{ marginTop: '14px', background: '#F9F5EE', color: '#1A5276', border: '1px solid #e0d8c8', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    Editar
                  </button>
                </div>
              ))}
            </div>

            {editandoQuarto && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '20px' }}>Editar quarto</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nome do quarto</label>
                    <input value={editandoQuarto.nome} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, nome: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Preco por noite (R$)</label>
                    <input value={editandoQuarto.preco} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, preco: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Capacidade</label>
                    <input value={editandoQuarto.capacidade} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, capacidade: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Comodidades</label>
                    <input value={editandoQuarto.comodidades} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, comodidades: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Descricao</label>
                    <textarea value={editandoQuarto.descricao || ''} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, descricao: e.target.value }) : prev)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Fotos por URL</label>
                    <textarea value={editandoQuarto.fotos} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, fotos: e.target.value }) : prev)} rows={4} placeholder="Cole uma URL de imagem por linha" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#555', fontSize: '14px' }}>
                    <input type="checkbox" checked={editandoQuarto.ativo} onChange={e => setEditandoQuarto(prev => prev ? ({ ...prev, ativo: e.target.checked }) : prev)} />
                    Quarto ativo
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={salvarEdicaoQuarto} style={{ background: '#1A5276', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    Salvar alteracoes
                  </button>
                  <button onClick={() => setEditandoQuarto(null)} style={{ background: '#fff', color: '#777', border: '1px solid #ddd', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '20px' }}>Adicionar novo quarto</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {camposNovoQuarto.map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="text" placeholder={f.placeholder} value={novoQuarto[f.key]}
                      onChange={e => setNovoQuarto(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Descrição</label>
                  <textarea placeholder="Descreva o quarto..." value={novoQuarto.descricao}
                    onChange={e => setNovoQuarto(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Fotos por URL</label>
                  <textarea placeholder="Cole uma URL de imagem por linha" value={novoQuarto.fotos}
                    onChange={e => setNovoQuarto(prev => ({ ...prev, fotos: e.target.value }))}
                    rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <button onClick={salvarQuarto} style={{ marginTop: '16px', background: '#1A5276', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                + Adicionar Quarto
              </button>
            </div>
          </div>
        )}

        {/* Bloqueios */}
        {aba === 'bloqueios' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8', maxWidth: '560px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '8px' }}>Bloquear datas</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Trave períodos que não estarão disponíveis para reserva (manutenção, uso pessoal, etc.)</p>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Quarto *</label>
                <select value={bloqueio.quarto_id} onChange={e => setBloqueio(prev => ({ ...prev, quarto_id: e.target.value }))}
                  style={{ ...inputStyle, background: '#fff' }}>
                  <option value="">Selecione um quarto</option>
                  {quartos.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Data início *</label>
                  <input type="date" value={bloqueio.data_inicio} onChange={e => setBloqueio(prev => ({ ...prev, data_inicio: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Data fim *</label>
                  <input type="date" value={bloqueio.data_fim} onChange={e => setBloqueio(prev => ({ ...prev, data_fim: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Motivo</label>
                <input type="text" placeholder="Ex: Manutenção, Uso pessoal..." value={bloqueio.motivo}
                  onChange={e => setBloqueio(prev => ({ ...prev, motivo: e.target.value }))} style={inputStyle} />
              </div>
              <button onClick={salvarBloqueio} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                🔒 Salvar Bloqueio
              </button>
            </div>
          </div>
        )}

        {/* Promoções */}
        {aba === 'promocoes' && (
          <div style={{ display: 'grid', gap: '24px', maxWidth: '760px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '8px' }}>Promocoes cadastradas</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Edite, desative ou remova promocoes que aparecem na pagina inicial.</p>

              <div style={{ display: 'grid', gap: '12px' }}>
                {promocoes.map(p => (
                  <div key={p.id} style={{ border: '0.5px solid #e0d8c8', borderRadius: '12px', padding: '16px', background: p.ativo ? '#fff' : '#fdf0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <h4 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', fontSize: '16px', margin: 0 }}>{p.titulo}</h4>
                          <span style={{ background: p.ativo ? '#1D6A3A22' : '#c0392b22', color: p.ativo ? '#1D6A3A' : '#c0392b', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                            {p.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p style={{ color: '#777', fontSize: '13px', margin: '6px 0' }}>{p.descricao || 'Sem descricao'}</p>
                        <div style={{ color: '#555', fontSize: '12px' }}>
                          {p.desconto_percentual}% OFF
                          {p.data_inicio && ` | De ${fmtData(p.data_inicio)}`}
                          {p.data_fim && ` ate ${fmtData(p.data_fim)}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => iniciarEdicaoPromocao(p)} style={{ background: '#F9F5EE', color: '#1A5276', border: '1px solid #e0d8c8', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          Editar
                        </button>
                        <button onClick={() => alternarPromocao(p)} style={{ background: '#fff', color: p.ativo ? '#c0392b' : '#1D6A3A', border: '1px solid #ddd', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          {p.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => excluirPromocao(p.id)} style={{ background: '#fdf0f0', color: '#c0392b', border: '0.5px solid #f5c6c6', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {promocoes.length === 0 && (
                  <div style={{ border: '0.5px dashed #d8ccb8', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                    Nenhuma promocao cadastrada.
                  </div>
                )}
              </div>
            </div>

            {editandoPromocao && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '20px' }}>Editar promocao</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Titulo da promocao *</label>
                    <input type="text" value={editandoPromocao.titulo}
                      onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, titulo: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Descricao</label>
                    <input type="text" value={editandoPromocao.descricao || ''}
                      onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, descricao: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Desconto (%) *</label>
                    <input type="number" value={editandoPromocao.desconto_percentual}
                      onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, desconto_percentual: e.target.value }) : prev)} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Valida de</label>
                      <input type="date" value={editandoPromocao.data_inicio} onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, data_inicio: e.target.value }) : prev)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valida ate</label>
                      <input type="date" value={editandoPromocao.data_fim} onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, data_fim: e.target.value }) : prev)} style={inputStyle} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#555', fontSize: '14px' }}>
                    <input type="checkbox" checked={editandoPromocao.ativo} onChange={e => setEditandoPromocao(prev => prev ? ({ ...prev, ativo: e.target.checked }) : prev)} />
                    Promocao ativa
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={salvarEdicaoPromocao} style={{ background: '#1A5276', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    Salvar alteracoes
                  </button>
                  <button onClick={() => setEditandoPromocao(null)} style={{ background: '#fff', color: '#777', border: '1px solid #ddd', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '0.5px solid #e0d8c8' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', color: '#1A5276', marginBottom: '8px' }}>Criar promocao</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>A promocao aparecera em destaque na pagina inicial do site.</p>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Titulo da promocao *</label>
                  <input type="text" placeholder="Ex: Promocao Fim de Semana" value={promocao.titulo}
                    onChange={e => setPromocao(prev => ({ ...prev, titulo: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Descricao</label>
                  <input type="text" placeholder="Ex: Reserve sex+sab com 20% de desconto" value={promocao.descricao}
                    onChange={e => setPromocao(prev => ({ ...prev, descricao: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Desconto (%) *</label>
                  <input type="number" placeholder="20" value={promocao.desconto_percentual}
                    onChange={e => setPromocao(prev => ({ ...prev, desconto_percentual: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Valida de</label>
                    <input type="date" value={promocao.data_inicio} onChange={e => setPromocao(prev => ({ ...prev, data_inicio: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Valida ate</label>
                    <input type="date" value={promocao.data_fim} onChange={e => setPromocao(prev => ({ ...prev, data_fim: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
                <button onClick={salvarPromocao} style={{ background: '#D4AC0D', color: '#3D2B00', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                  Criar Promocao
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
