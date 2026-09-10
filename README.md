# Cadeira85 — Demo comercial para barbearias

Demo estática, responsiva e interativa de um sistema de agendamento para barbearias.

## O que existe na demo

- `index.html` — landing page do produto;
- `agendar.html` — experiência do cliente;
- `painel.html` — painel demonstrativo da barbearia;
- horários ocupados são bloqueados;
- um novo agendamento feito em `agendar.html` aparece em `painel.html`;
- painel permite confirmar/cancelar reservas;
- KPIs simulam agenda, receita prevista, ocupação e ticket médio;
- os dados ficam no `localStorage` do navegador: não há backend e nenhum dado é enviado para terceiros.

## Rodar localmente

```bash
cd cadeira85-demo-v2
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.

## Publicação gratuita

Por ser uma demo 100% estática, ela pode ser hospedada gratuitamente em GitHub Pages, Cloudflare Pages, Netlify ou Vercel. Para prospecção, uma URL curta e limpa é muito melhor do que enviar arquivos.

## Personalizar

A maior parte dos dados da barbearia está em `config.js`:
- nome;
- endereço;
- WhatsApp;
- serviços;
- preços;
- profissionais;
- horários.

O visual está em `styles.css`.

## Limitações intencionais da demo

Esta NÃO é ainda a versão comercial. Para uso real, implemente backend, banco de dados, autenticação, concorrência/transações para impedir reservas simultâneas, regras de disponibilidade, notificações e tratamento adequado de dados pessoais.

## Próxima versão comercial sugerida

Stack simples:
- Frontend: HTML/CSS/JS ou React;
- API: FastAPI ou Node.js;
- Banco: PostgreSQL;
- Deploy: frontend + API + PostgreSQL;
- autenticação para o painel;
- uma página pública por estabelecimento;
- confirmação/cancelamento;
- bloqueios e folgas do profissional;
- integração oficial de mensagens apenas quando necessária.
