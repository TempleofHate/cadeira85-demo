# Cadeira85

**Menos mensagens. Mais horários ocupados.**

Demonstração comercial interativa de agendamento e gestão para barbearias. Foi pensada para ser aberta pelo celular a partir do WhatsApp ou Instagram. A **Barbearia Horizonte** é um estabelecimento fictício criado no Cadeira85; Cadeira85 é o nome do software.

## Experimente

- `index.html`: apresentação curta, prévia da agenda e acesso aos dois lados da demo.
- `agendar.html`: serviço → profissional → data → horário → nome/WhatsApp → pagamento → confirmação.
- `painel.html`: agenda por período, profissional e status; indicadores de hoje; confirmar, cancelar e concluir; restauração dos exemplos.

Serviços demonstrativos: Corte (R$ 35), Barba (R$ 25), Corte + Barba (R$ 55) e Corte + Sobrancelha (R$ 45). Datas são geradas pelo relógio local do navegador. Domingos e horários passados são indisponíveis. A duração do serviço também bloqueia horários sobrepostos.

## Rodar localmente

Na raiz do repositório:

```bash
python3 -m http.server 8080
```

Abra **http://localhost:8080**. Use um servidor HTTP; abrir HTML com `file://` não carrega os módulos corretamente. Não há instalação, build, framework ou backend necessários para usar o site.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| `config.js` | Marca, barbearia, serviços, profissionais, horários, chave de armazenamento e contato comercial |
| `storage.js` | Exemplos iniciais, validação dos registros, persistência, disponibilidade, sobreposição e transições de status |
| `utils.js` | Datas locais, moeda, escape de conteúdo, notificações e confirmação acessível |
| `landing.js` | Horários clicáveis da prévia e CTA comercial |
| `booking.js` | Etapas, validação, resumo, simulação e recibo |
| `admin.js` | Agenda, filtros, indicadores e ações do proprietário |
| `styles.css` | Design system e regras responsivas compartilhadas |
| `assets/` | Favicon SVG e fonte Manrope com licença OFL; tudo local |
| `tests/browser.cjs` | Testes reais de navegação em Chromium e auditoria axe |

JavaScript usa módulos ES nativos. Nenhum dado do usuário é interpolado sem escape no HTML. A demo não carrega bibliotecas, fontes ou imagens remotas em execução.

## Persistência e restauração

A chave `cadeira85_demo_v4` contém reservas e informações de pagamento no `localStorage` deste navegador e origem. A primeira visita cria clientes fictícios. Recarregar preserva alterações; abrir em outro aparelho, navegador ou contexto privado não compartilha a agenda. Dados de versões anteriores são mantidos, mas não usados por este novo esquema.

O bloqueio compara intervalos completos de atendimento. Cancelar libera o intervalo, desde que não haja outra reserva sobreposta ou o horário já tenha passado. Web Locks serializa gravações entre abas quando suportado; eventos de armazenamento atualizam a interface. Isso não substitui uma transação de backend.

No painel, **Restaurar dados da demonstração** pede confirmação e substitui as reservas por exemplos com datas atualizadas. Dados corrompidos podem ser recuperados pela mesma ação. Bloqueios de armazenamento são comunicados sem exibir uma reserva falsamente concluída.

Os indicadores são de **hoje**, independentemente do filtro da lista. Receita prevista soma serviços não cancelados, incluindo concluídos; confirmados conta somente o status confirmado; sinais recebidos soma depósitos Pix não cancelados. Valores pagos de reservas canceladas ficam no histórico, sem simulação de estorno. Concluir atendimento não marca automaticamente o saldo como recebido.

## Pagamentos e mensagens simulados

- **Pix**: sinal de 30%, código deliberadamente inválido, desenho de QR com marca DEMO e aprovação manual simulada.
- **Cartão**: cartão cenográfico pronto, sem campos para dados financeiros, pagamento integral simulado.
- **No local**: nenhum valor antecipado; pagamento previsto após o atendimento.

Não há cobrança, credencial de pagamento válida, captura de cartão, transmissão de dados financeiros ou envio automático de WhatsApp. Use nomes e telefones fictícios nos testes. Os valores salvos demonstram status, não comprovam pagamentos.

## Contato comercial — configurar antes de divulgar

Em **`config.js`**, preencha somente `config.contact.whatsapp` com o número comercial real, incluindo DDI e DDD, sem pontuação. O valor vazio é um **placeholder intencional**. Sem configuração, o botão explica que o contato ainda não está disponível e orienta falar com quem compartilhou o link. Com número válido, abre uma conversa com texto pré-preenchido; o visitante decide se envia. Não duplique o telefone em outros arquivos.

## Impeccable

A instalação local existente foi utilizada, sem reinstalação: `SKILL.md`, comando `context`, orientação `init`, `new-work`, `operate`, `craft-floor`, `critique`, `audit` e `polish`. O briefing fornecido orienta `PRODUCT.md`, o contrato da superfície e o sistema documentado em `DESIGN.md` e `.impeccable/design.json`. A execução priorizou construção direta em código a partir do briefing; não houve aprovação de comp de imagem nem entrevista adicional.

A revisão usa capturas em larguras definidas e correções agrupadas. Evidências locais ficam em `.impeccable/review/` (não publicadas como assets da aplicação); consulte `VALIDACAO.md` para o que foi realmente verificado e as limitações.

## Testes de desenvolvimento (opcionais)

As ferramentas de teste são separadas do site estático:

```bash
npm install --prefix /tmp/c85-tools playwright @axe-core/playwright
PLAYWRIGHT_BROWSERS_PATH=/tmp/c85-browsers /tmp/c85-tools/node_modules/.bin/playwright install chromium
DEMO_URL=http://localhost:8080/ NODE_PATH=/tmp/c85-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/tmp/c85-browsers node tests/browser.cjs
```

O teste usa navegador isolado, relógio controlado para cenários determinísticos e dados fictícios. Não altera reservas de um navegador pessoal.

## Commit, push e GitHub Pages

Revise antes de enviar:

```bash
git status
git diff --check
git diff
```

Adicione os arquivos da demo e documentação, faça commit e envie à sua branch:

```bash
git add index.html agendar.html painel.html styles.css config.js storage.js utils.js landing.js booking.js admin.js assets tests README.md PRODUCT.md DESIGN.md VALIDACAO.md .gitignore .impeccable/design.json .impeccable/surfaces

git commit -m "Redesenha demo comercial interativa do Cadeira85"
git push origin HEAD
```

Em **Settings → Pages**, selecione **Deploy from a branch**, a branch que recebeu o commit e **/(root)**. Aguarde a publicação e abra a URL exibida pelo GitHub. Se Pages já estiver configurado para essa branch, um novo push atualiza o site. Todos os caminhos são relativos, inclusive módulos, fonte, favicon e navegação, permitindo `https://username.github.io/cadeira85-demo/`.

O repositório não foi publicado automaticamente. A publicação por branch disponibiliza os arquivos públicos do repositório: mantenha planilhas de prospecção e qualquer dado privado fora dele. `leads.csv` e `PROSPECCAO.md` existentes não são usados pela aplicação.

## Para virar produto em produção

Será necessário backend com autenticação e autorização por barbearia, banco de dados com reservas transacionais, políticas de horário/fuso, gestão de equipe, segurança e privacidade dos clientes, backups e tratamento de falhas. Pagamentos reais precisam de checkout de provedor, webhooks verificados, conciliação e regras de cancelamento/estorno. Notificações precisam de integração autorizada. A demo não oferece sincronização entre aparelhos, autenticação, Pix real, mensagens, cobrança ou estornos.
