# Validação da retomada — Cadeira85

Revisão de 11 de setembro de 2026, retomando `9e07667` sem substituir o redesign existente.

## Estado recuperado

O histórico inspecionado foi `9e07667` (WIP do redesign), `ad1b6cd` (Impeccable), `07b8b17` (pagamentos simulados) e `16b316a` (demo inicial). A árvore estava limpa. O pedido original completo não está no repositório; o escopo recuperável vem de `PRODUCT.md`, `DESIGN.md`, do contrato em `.impeccable/surfaces/index-html.md`, do README e do diff do WIP.

| Requisito recuperado | Estado na retomada |
| --- | --- |
| Landing, prévia clicável, identidade Cadeira85 / Barbearia Horizonte | Implementado |
| Serviço, profissional, data, horário, dados, pagamento e confirmação | Implementado |
| Pix de 30%, cartão integral e pagamento no local, todos simulados | Implementado |
| Painel, filtros, indicadores, confirmar, concluir, cancelar e restaurar | Implementado |
| Persistência, sobreposição, datas dinâmicas e erros de armazenamento | Implementado; validação final pendente |
| Fonte local, favicon, tokens, responsividade e documentação visual | Implementado |
| Testes de navegador | Parcial: última execução interrompida por falha no cenário de armazenamento bloqueado |
| Crítica, auditoria, polimento e relatório de validação | Fechamento pendente; este arquivo não existia |
| Contato comercial | Placeholder intencional; depende do número real do proprietário |

## Correções da retomada

- A suíte cria sua pasta de resultados, inclusive em checkout novo.
- O teste de armazenamento bloqueado usa um contexto isolado. Antes, reservas existentes evitavam a gravação inicial e tornavam incorreta a expectativa de erro ao abrir a página.
- “Limpar filtros” devolve o foco ao período após remover o estado vazio; regressão confirmada com Enter e coberta pelo teste.
- O resumo só apresenta o total após selecionar um serviço; a forma e a decomposição do pagamento aparecem na etapa de pagamento, sem valores zerados ou escolha financeira prematura.

## Crítica Impeccable

Method: dual-agent (A: /root/design_review · B: /root/technical_review).

A avaliação visual terminou antes da síntese dos achados do detector. A direção “agenda aberta” foi preservada: a prévia permite testar uma reserva real na demo, a linguagem distingue software e barbearia fictícia, e as três telas compartilham hierarquia, tipografia e estados legíveis. As oportunidades eram locais, sem justificativa para outro redesign.

| Heurística | Nota inicial / 4 | Evidência |
| --- | --- | --- |
| Visibilidade do estado | 3 | Etapas, resumo, recibo e notificações explícitos |
| Linguagem do usuário | 4 | Serviços, horários e pagamentos em português natural |
| Controle e liberdade | 3 | Voltar, cancelar e restaurar; rascunho não persiste no reload |
| Consistência | 4 | Componentes compartilhados entre as três telas |
| Prevenção de erros | 3 | Sobreposição, validação e confirmação destrutiva |
| Reconhecimento | 3 | Resumo disponível; informação financeira prematura corrigida |
| Eficiência | 2 | Fluxo guiado, sem ferramentas avançadas de operação |
| Estética e simplicidade | 4 | Agenda como conteúdo central, hierarquia clara |
| Recuperação de erros | 3 | Erros acionáveis; foco ao limpar filtros corrigido |
| Ajuda | 3 | Instruções contextuais e limitações da simulação |
| **Total** | **32/40 — bom** | Avaliação inicial; não foi inflada após correções |

As duas prioridades implementáveis neste fechamento eram **P2: foco perdido** e **P2: resumo financeiro prematuro**, ambas corrigidas. Casey, cliente interrompido no celular, ainda perde o rascunho ao recarregar; isso fica como melhoria futura, pois o escopo recuperado exige persistência das reservas finalizadas. Sam, usuário de teclado, agora mantém um ponto previsível após limpar filtros. O proprietário consegue testar os dois lados, mas o contato depende do número real já identificado como decisão aberta.

A carga cognitiva é baixa nas escolhas iniciais e moderada nas 14 datas e 12 horários ordenados. Não foi acrescentada navegação para esconder opções familiares. A confirmação termina com valores e acesso direto ao painel. A ausência do contato real permanece explicitamente comunicada.

Questions skipped: duas prioridades de polimento implementável; o usuário já autorizou concluir a revisão preservando o trabalho anterior.

## Auditoria e confirmação final

**Integridade: aprovada para o escopo da demo.** Detector CLI: cinco achados, sem bloqueio. `cream-palette` nas três páginas corresponde à paleta expressamente fixada em DESIGN.md; `cramped-padding` na landing é falso positivo, pois `.benefits` usa 64px de espaçamento vertical. `design-system-color` identifica o tom auxiliar `#d5e2d7` em `.preview-heading p`, uma exceção local documentada, sem alteração visual necessária.

| Dimensão | Nota / 4 | Limite da conclusão |
| --- | --- | --- |
| Acessibilidade | 3 | Axe sem violações nos quatro estados auditados; sem leitor de tela manual |
| Performance | 3 | Assets locais e ausência de dependências em execução; sem benchmark em aparelho físico |
| Responsividade | 3 | Cinco larguras e etapas intermediárias verificadas |
| Tematização | 3 | Tema claro intencional, tokens compartilhados e exceções locais |
| Integridade | 4 | Fluxos conectados e simulação explicitamente identificada |
| **Total** | **16/20 — bom** | Sem P0/P1 encontrados na cobertura executada |

Execução final de `tests/browser.cjs`: **aprovada**, após as correções. Sete jornadas, 35 verificações responsivas em 360, 390, 430, 768 e 1440px, quatro análises axe e 12 cenários adicionais. Zero erros de console, assets/links com falha, overflow horizontal ou alvos abaixo do limiar de altura do teste nas telas medidas. A suíte verifica altura dos alvos; não equivale a provar 44×44px em todos os controles e estados.

Foram confirmados pagamentos e saldos, bloqueio por duração, cancelamento liberando horário, persistência após reload, restauração, erros de formulário, teclado, movimento reduzido, recuperação de dados corrompidos, URL inválida, concorrência de reservas com Web Locks, datas futuras, domingo fechado e armazenamento bloqueado. Novas asserções cobrem o foco após limpar filtros e a divulgação progressiva dos valores no resumo. As capturas finais do agendamento foram inspecionadas, preservando a composição original.

## Evidências e limites

Capturas e resultados de desenvolvimento ficam em `.impeccable/review/`, ignorados pelo Git. Nenhum asset raster é distribuído pela aplicação; fonte local com licença OFL e favicon SVG foram preservados.

O teste utiliza dados fictícios e relógio controlado, em Chromium. Não equivale a validação manual com leitor de tela, Safari/iOS, Firefox, aparelhos físicos ou rede móvel. A aplicação continua sendo uma demo local, sem backend, cobrança ou mensagens reais. O número comercial permanece vazio. A retomada não inclui publicação remota.

A verificação suplementar de 320px e texto ampliado não produziu resultado completo: parou num seletor de estado vazio; a tentativa posterior encontrou o servidor principal já encerrado. Não se reivindica cobertura de 320px ou zoom de 200%. O overlay Impeccable foi tentado, mas o script parou antes da injeção; a evidência utilizada foi Playwright headless, capturas e detector CLI. O servidor de overlay foi encerrado e seu script temporário removido; não há overlay visível. Não havia lista de exceções de crítica. O snapshot `index-html` foi salvo e fechado após o polimento; primeira avaliação, sem tendência anterior.
