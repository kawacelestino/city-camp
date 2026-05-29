import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { reserva, quarto, cliente } = await req.json()

  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY

  if (!phone || !apikey || phone === 'your_phone_number') {
    console.log('WhatsApp não configurado ainda')
    return NextResponse.json({ ok: true, msg: 'WhatsApp não configurado' })
  }

  const checkin = new Date(reserva.data_checkin + 'T12:00:00').toLocaleDateString('pt-BR')
  const checkout = new Date(reserva.data_checkout + 'T12:00:00').toLocaleDateString('pt-BR')

  const msg = `🏨 *Nova Reserva - City Camp*\n\n` +
    `👤 Cliente: ${cliente.nome}\n` +
    `📱 WhatsApp: ${cliente.telefone}\n` +
    `📧 Email: ${cliente.email}\n\n` +
    `🛏 Quarto: ${quarto.nome}\n` +
    `📅 Check-in: ${checkin}\n` +
    `📅 Check-out: ${checkout}\n` +
    `💰 Total: R$ ${reserva.valor_total.toFixed(2).replace('.', ',')}\n\n` +
    `✅ Reserva confirmada automaticamente!`

  const encodedMsg = encodeURIComponent(msg)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apikey}`

  try {
    await fetch(url)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao enviar WhatsApp:', err)
    return NextResponse.json({ ok: false })
  }
}
