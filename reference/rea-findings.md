# Registro da comparação — 14/10/2026

## Fonte e método

Referência pública: https://www.astronmembers.com.br/.

O MCP REA descobriu a página no Chrome e capturou DOM, acessibilidade, recursos, scripts do mesmo domínio e screenshots. HTML e CSS públicos foram salvos separadamente em `original.html` e `original.css`; essas duas cópias vieram de uma requisição HTTP comum, não do REA.

Evidências REA retidas nesta sessão:

| Operação | Evidence ID | Escopo |
| --- | --- | --- |
| list_browser_targets | ev_6861f169612755527a1cac20ac6ce82d460141ae5227bda4c9be511bdfcdffe9 | Página original e identidade do Chrome |
| inspect_web_page | ev_5c9622ec6efb6e2b030fc27bfbaa23111890afb940b49c6ed0beb385f88d13cb | DOM, acessibilidade e scripts do domínio original |
| capture_web_screenshot | ev_216fa2d69d52f03c8af6a5dd99217093fdb98e1c2df5556f2392ddacbaf5216d | Viewport original 764 × 485 |
| capture_web_screenshot | ev_f58f229cf98a501bdacbc73e451ac599f000150844ac0f32c06010cf2d3e16ff | Hero original 390 × 844 |

## Achados e implementação

1. **Cadastro.** O primeiro painel visível do original contém o formulário. Há uma tela Academy adicional no DOM, mas ela fica oculta. A implementação preserva o formulário exibido. A altura do card foi alinhada de 305 px para 286,796875 px, igual à medida do original na comparação desktop.
2. **Hero móvel.** A referência usa título de 28 px até 480 px, quebra natural dos botões de cadastro, gutters de 20 px e espaço reservado para a legenda das abas. Esses ajustes foram aplicados. A imagem de fundo desaparece completamente após a inatividade do ponteiro, como na referência.
3. **Funil.** A referência usa estágio de 316 px no desktop desde 960 px, laterais flexíveis e estágio de 232 px no celular. Foram alinhados proporções, introdução e linha vertical de progresso.
4. **Ferramentas.** Foram alinhados a proporção de imagem 16:10, badges de logos, hover, carrossel e modal de até 960 px com duas colunas desde 820 px.
5. **Integrações.** Nomes e categorias dos 48 cards foram comparados com o HTML original. Foram corrigidas oito categorias, incluindo vídeo, atendimento, marketing e rastreamento, além dos estilos dos cards.
6. **Usabilidade.** Foram adicionados controles de teclado e relações ARIA para as abas; módulos e leads podem avançar a demonstração pelo teclado. Níveis móveis inativos ficam inert. E-mails inválidos não avançam, o autoplay pausa com foco no formulário e os cards do CRM têm rolagem.

Os itens de usabilidade são melhorias da reconstrução; não representam afirmação de equivalência com o comportamento original.

## Validação executada

Chrome 155; sem erros de JavaScript observados durante os checks. `node --check` passou em `js/main.js` e `js/data.js`.

19 checks de navegador passaram: navegação das abas com setas/Home, bloqueio de cadastro vazio/inválido, cadastro → vitrine → CRM → venda, e-mail no lead, rolagem do CRM, modal via teclado/Escape, foco/drill-down/Tab/Escape do menu móvel, breakpoint do funil e pausa do autoplay por 8,5 segundos durante preenchimento.

Sem overflow horizontal nas larguras 360, 390, 768, 960, 1024 e 1440 px. Estágio do funil: 232 px abaixo de 960 e 316 px desde 960.

## Limites e continuidade

REA fez observação passiva; as ações de navegação e os checks foram executados separadamente com Playwright. A observação do REA começa no momento da conexão, não inclui atividade anterior de rede/console, filtra outros domínios e não estabelece identidade de um artefato local do original. Não foi afirmada equivalência pixel a pixel ou conclusão da recriação de todo o site.

Permanecem fora desta rodada: páginas individuais de recursos, tradução completa além de navegação/hero, funcionamento real de conta e hospedagem local de todos os assets. Os screenshots salvos em `screenshots/` documentam estados específicos e podem incluir posições diferentes de animações e rolagem.
