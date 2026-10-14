# Astron Members — Recriação Canônica

Recriação estática de altíssima fidelidade, performance e acessibilidade da plataforma pública [Astron Members](https://www.astronmembers.com.br/).

Desenvolvido com tecnologias web nativas (HTML5 semântico, CSS3 com variáveis de design e Vanilla JavaScript modular), 100% autônomo, auto-hospedado (*offline-first*) e livre de rastreadores invasivos de terceiros.

---

## Como Visualizar Localmente

Inicie o servidor HTTP local na porta `5510`:

```powershell
python -m http.server 5510 --bind 127.0.0.1
```

Em seguida, abra [http://127.0.0.1:5510/](http://127.0.0.1:5510/) no navegador.  
A configuração equivalente de execução está pronta em `.claude/launch.json`.

---

## Arquitetura do Projeto

### 1. Páginas e Estrutura
- **`index.html`**: Landing page principal com:
  - Hero imersivo com efeito lanterna interativo (`pointermove`) e formulário de onboarding simulado.
  - Demonstração funcional de CRM em tempo real com pipeline dinâmico, rolagem de leads e transição para vitrine de módulos.
  - Mega-menu multinível responsivo com suporte a teclado, navegação acessível e atributos `inert` nos níveis inativos.
  - Grid de 48 integrações oficiais com categorização precisa (pagamentos, vídeo, marketing, atendimento).
  - Vitrine estilo streaming, carrossel de ferramentas com modal em duas colunas e accordions de FAQ.
  - Sistema de internacionalização (i18n) em tempo real (Português, Inglês, Espanhol e Francês).
- **`planos.html`**: Página dedicada com tabela comparativa de 5 planos (Teste Grátis, Starter, Professional, Scale, Enterprise), regras de cobrança por membro ativo, custos adicionais (SMS, IA) e FAQ.
- **`recursos/`**: 20 páginas de detalhe (índice `/recursos/` e 19 sub-páginas como CRM, Vitrine Netflix, Aplicativo, Astron Pages, Comunidades, etc.), compiladas com layout dedicado e acessibilidade refinada.

### 2. Estilos e Scripts
- **`css/style.css`**: Design tokens e layout da landing page principal.
- **`css/resources.css` & `css/resource-overrides.css`**: Estilos das páginas de recursos e ajustes de acessibilidade (`[inert]`, redução de movimento).
- **`js/data.js`**: Fonte única da verdade para itens de menu, carrosséis, gateways e recursos.
- **`js/main.js`**: Lógica de interação da home, acessibilidade, modal dialogs, CRM interativo e orquestração de idioma.
- **`js/resource-main.js`**: Comportamentos e interações das páginas de recursos.
- **`js/i18n.js` & `js/translations.js`**: Motor e dicionário canônico com +320 KB de traduções em tempo real com persistência em `localStorage`.

### 3. Assets Locais (*Offline-First*)
- **`images/`**: 110 assets visuais (imagens, vetores SVG, logotipos e o loop MP4 do CRM) baixados e servidos localmente.
- **`favicon/`**: Ícones de favoritos da aplicação servidos localmente.

### 4. Ferramentas e Scripts de Suporte (`scripts/`)
- **`scripts/build-resource-pages.py`**: Pipeline offline que processa os HTMLs de referência, remove pixels e scripts de terceiros e reescreve links/assets para rotas locais.
- **`scripts/download-assets.py`**: Utilitário para varredura e download automático de assets públicos.
- **`scripts/check-links.py`**: Validador de integridade de links internos (929 links auditados e aprovados com 100% de integridade).
- **`scripts/scan-assets.py`**: Auditoria e inventário de referências de mídia.

---

## Registro de Avanços — 14/10/2026

1. **Reconstrução das Páginas de Recursos e Planos**:
   - Todas as 20 páginas de recursos (`recursos/*.html`) e `planos.html` foram compiladas e integradas localmente.
   - Geração e inclusão da página faltante `recursos/astron-pages.html`.
2. **Internacionalização Completa (i18n)**:
   - Conexão do motor `js/i18n.js` e do dicionário `js/translations.js` no `index.html`.
   - Tradução dinâmica em tempo real para todo o corpo da página (hero, recursos, funil, CRM, planos, FAQ e rodapé) nos idiomas PT-BR, EN, ES e FR.
3. **Auto-Hospedagem de Assets (Offline-First)**:
   - Download de todos os 113 assets (`images/` e `favicon/`, incluindo o vídeo loop MP4 do CRM).
   - Reescrita das URLs em `index.html`, `js/data.js`, `css/resources.css` e nas páginas de recursos para caminhos locais.
4. **Auditoria e Integridade**:
   - 929 links internos testados e validados sem nenhum 404.
   - Sintaxe JavaScript verificada com `node --check` em todos os 5 módulos JS.
   - Servidor HTTP local verificado com resposta `200 OK` em todas as rotas e assets.
