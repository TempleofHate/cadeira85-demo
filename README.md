# Cadeira85 — Demo comercial para barbearias

Demo estática, responsiva e interativa de agendamento, gestão e pagamentos simulados para barbearias.

## Fluxos demonstrados

- cliente escolhe serviço, profissional, data e horário;
- opção de **Pix com sinal de 30%**, **cartão** ou **pagamento no local**;
- Pix e cartão são 100% simulados: nenhum dinheiro é processado;
- reserva aparece no painel da barbearia;
- painel mostra status do agendamento e do pagamento;
- painel calcula receita prevista, total recebido online e ocupação;
- horários já reservados deixam de ficar disponíveis para o mesmo profissional;
- tudo é salvo apenas no `localStorage` do navegador.

## Segurança da demo

A tela de cartão é somente cenográfica e exibe um aviso para usar dados fictícios. Dados de cartão não são gravados. O QR Pix e o código Pix são propositalmente inválidos.

## Rodar localmente

```bash
cd cadeira85-demo-v2
python3 -m http.server 8080
```

Abra `http://localhost:8080`.

## Publicação

A demo continua 100% estática e pode ser publicada em GitHub Pages, Cloudflare Pages, Netlify ou Vercel.

## Para virar produto real

Não implemente cartão por conta própria nem armazene dados sensíveis. Integre um provedor de pagamentos e deixe a captura de cartão sob responsabilidade do checkout/tokenização do provedor. Para Pix real, gere cobranças e confirme o pagamento por webhook/API. A versão comercial também precisa de backend, PostgreSQL, autenticação, regras de disponibilidade e proteção contra reservas simultâneas.
