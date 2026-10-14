# Fontes públicas de recursos e planos

Foram obtidos 20 HTMLs por GET: os 18 caminhos únicos `recursos/*.html` referenciados em `js/data.js`, o índice `/recursos/` e `/planos.html`. Todos terminaram com HTTP 200. Os 19 caminhos `.html` receberam primeiro HTTP 308 para a URL equivalente sem extensão, no mesmo host `www.astronmembers.com.br`. Os nomes locais preservam `.html`; o índice está em `index.html`.

`inventory.json` registra URL solicitada/final, redirects, status, título, H1, classes do body, scripts, CSS, referências de imagens e localização/classificação dos scripts inline. A classificação usa palavras-chave e serve como índice para revisão, sem executar código. As imagens e vídeos não foram baixados.

## Dependências compartilhadas

Todas as páginas usam `css/novosite.css?v=292`, Font Awesome 6.1.1 e as fontes Manrope, Cabin, Instrument Serif, Inter e Poppins via Google Fonts. Nas páginas dentro de recursos, os caminhos do próprio site começam com `../`.

Os três arquivos externos de UI são `translations/novosite.js?v=157`, `js/i18n.js?v=117` e `js/main.js?v=151`. Há também Google Analytics/Google Ads e Cloudflare como scripts externos. Todas as páginas incluem cinco scripts inline de rastreamento: inicialização Analytics, Ads, Meta Pixel, oaiq e callback de conversão. Esses scripts são referências do site público, separados das demonstrações de UI pelo inventário.

## Demonstrações específicas em scripts inline

| Arquivo | Linha inicial | Componente |
| --- | ---: | --- |
| campanhas.html | 296 | `.cmp-demo`: seleção de segmentos/campanha |
| comunidades.html | 301 | `.cm-feed`: categorias e feed |
| formularios-de-inscricao.html | 300 | `.fm-demo`: configuração e prévia do cadastro |
| hospedagem-de-videos.html | 299 | `.vl-demo`: biblioteca de vídeos |
| importacao-de-usuarios.html | 300 | `.imp-demo`: simulação de importação |
| notificacoes-push.html | 299 | `.push-demo`: prévia de notificação |
| protecao-drm.html | 299 e 317 | `.drm-lab` e `.drm-demo`: proteção e marca d'água |
| sistema-de-personalizacao.html | 300 | `.cz-demo`: personalização da vitrine |
| tags-e-pixels.html | 303 | `.tag-demo`: simulação de eventos e pixels |
| termos-de-uso-personalizado.html | 298 | `.tos-demo`: prévia e aceite dos termos |

As demais páginas dependem do JS compartilhado para UI. Algumas possuem dados estruturados `VideoObject` em scripts `application/ld+json`; o inventário os distingue das demonstrações.

## Variações relevantes para a implementação

- O índice tem hero próprio, grade de recursos, prova numérica e CTA; não usa a sequência completa de uma página individual.
- Todas as páginas possuem `body.rec-page`, com cores de destaque diferentes em `--acc` no atributo style.
- CRM possui vídeo MP4 local referenciado em `../images/videos/crm-pipeline-loop.mp4`, além do vídeo de YouTube no hero.
- Vitrine possui galeria horizontal e seção de conteúdo bloqueado; Aplicativo usa bento; Certificados tem composição específica; Depoimentos usa carrossel de testemunhos.
- Recursos relacionados usam links relativos entre páginas `.html`, apesar dos redirects públicos para URLs sem extensão.
- Planos adiciona tabela com cinco níveis (incluindo Enterprise), recursos comuns, custos extras e FAQ. A seção de custos extras lista SMS e automações com IA; o HTML é a fonte para preservar essa parte.
- CTAs incluem links longos de OAuth do Google embutidos no HTML. Eles fazem parte da fonte pública; nenhuma navegação de login ou cadastro foi executada nesta coleta.

## Falhas resolvidas

A tentativa inicial sem permissão de rede falhou por conexão recusada. Na primeira coleta autorizada, `Invoke-WebRequest` com redirecionamento desativado apresentou erro nas respostas 308. A coleta final usou `HttpClient` no PowerShell, seguindo apenas HTTPS no host original. Não há falhas remanescentes nos 20 itens do inventário.
