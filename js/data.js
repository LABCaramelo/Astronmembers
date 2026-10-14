/* Conteúdo repetitivo da página (menus, carrosséis, grades).
   main.js monta o HTML a partir daqui — editar um item aqui atualiza todos os lugares onde ele aparece. */
(function () {
  "use strict";

  var IMG = "/images/";
  var SITE = "/";
  var CENTRAL = "https://central.astronmembers.com.br/";

  /* Recursos (mega-menu "Recursos", carrossel do ecossistema e barra de ferramentas) */
  var recursos = [
    { id: "crm", group: "aluno", title: "CRM Nativo", desc: "Pipelines pra acompanhar cada lead", page: "recursos/crm.html", icon: "fa-solid fa-table-columns", grad: ["#5dadff", "#2488d4"], tsum: "tsum-crm.webp" },
    { id: "vitrine", group: "aluno", title: "Vitrine estilo streaming", desc: "Catálogo visual dos seus cursos", page: "recursos/vitrine-estilo-netflix.html", icon: "fa-solid fa-film", grad: ["#e59da0", "#e872bb"], tsum: "tsum-vitrine.webp" },
    { id: "app", group: "aluno", title: "Aplicativo", desc: "App para iOS e Android", page: "recursos/aplicativo.html", icon: "fa-solid fa-mobile-screen-button", grad: ["#a34aa3", "#e625cf"], tsum: "tsum-aplicativo.webp" },
    { id: "comunidades", group: "aluno", title: "Comunidades", desc: "Espaço de troca entre os alunos", page: "recursos/comunidades.html", icon: "fa-solid fa-users", grad: ["#DA1A47", "#c9287e"], tsum: "tsum-comunidades.webp" },
    { id: "certificados", group: "aluno", title: "Central de certificados", desc: "Certificados para os seus alunos", page: "recursos/central-de-certificados.html", icon: "fa-solid fa-graduation-cap", grad: ["#d0deb8", "#cccb8d"], tsum: "tsum-certificados.webp" },
    { id: "idiomas", group: "aluno", title: "Multi idiomas", desc: "Plataforma em vários idiomas", page: "recursos/multi-idiomas.html", icon: "fa-solid fa-language", grad: ["#24bbd6", "#2488d4"], tsum: "tsum-multiidiomas.webp" },
    { id: "videos", group: "aluno", title: "Hospedagem de vídeos", desc: "Suas aulas em vídeo, direto na Astron", page: "recursos/hospedagem-de-videos.html", icon: "fa-solid fa-video", grad: ["#a99aff", "#7c5cff"] },

    { id: "automacoes", group: "vendas", title: "Automações", desc: "Fluxos que agem sozinhos", page: null, soon: true, icon: "fa-solid fa-bolt", grad: ["#22c55e", "#16a34a"] },
    { id: "campanhas", group: "vendas", title: "Campanhas e Mensagens", desc: "Envie comunicados pro seu público", page: "recursos/campanhas.html", icon: "fa-solid fa-bullhorn", grad: ["#f2a73b", "#ff7a3d"] },
    { id: "depoimentos", group: "vendas", title: "Depoimentos", desc: "Depoimentos reais de quem já migrou", page: "recursos/depoimentos.html", icon: "fa-regular fa-star", grad: ["#ff5a3d", "#e8402f"] },
    { id: "multiplanos", group: "vendas", title: "Criação de multiplanos", desc: "Vários planos e níveis de acesso", page: "recursos/criacao-de-multiplanos.html", icon: "fa-solid fa-layer-group", grad: ["#ff5c71", "#d93071"], tsum: "tsum-multiplanos.webp" },
    { id: "formularios", group: "vendas", title: "Formulários de inscrição", desc: "Capte dados na entrada do aluno", page: "recursos/formularios-de-inscricao.html", icon: "fa-solid fa-address-card", grad: ["#98d9b6", "#71d981"], tsum: "tsum-formularios.webp" },
    { id: "importacao", group: "vendas", title: "Importação de usuários", desc: "Traga a sua base de alunos", page: "recursos/importacao-de-usuarios.html", icon: "fa-solid fa-user-plus", grad: ["#d2fae2", "#8de691"], tsum: "tsum-importacao.webp" },
    { id: "tags", group: "vendas", title: "Tags e pixels", desc: "Gerencie pixels e integrações", page: "recursos/tags-e-pixels.html", icon: "fa-solid fa-code", grad: ["#3ec9a7", "#3ec779"], tsum: "tsum-tags.webp" },
    { id: "push", group: "vendas", title: "Notificações push", desc: "Avise o aluno direto pelo app", page: "recursos/notificacoes-push.html", icon: "fa-solid fa-bell", grad: ["#ff8a6b", "#e8402f"] },

    { id: "drm", group: "seguranca", title: "Proteção DRM", desc: "Proteja os seus vídeos", page: "recursos/protecao-drm.html", icon: "fa-solid fa-lock", grad: ["#616668", "#6b8f8f"], tsum: "tsum-drm.webp" },
    { id: "admins", group: "seguranca", title: "Administradores e permissões", desc: "Equipe com acesso por função", page: "recursos/administradores-e-permissoes.html", icon: "fa-solid fa-users-gear", grad: ["#ffa492", "#e38f56"], tsum: "tsum-administradores.webp" },
    { id: "termos", group: "seguranca", title: "Termos de uso personalizado", desc: "Seus termos para os alunos", page: "recursos/termos-de-uso-personalizado.html", icon: "fa-solid fa-file-contract", grad: ["#2b879e", "#30b3a6"] },
    { id: "personalizacao", group: "seguranca", title: "Sistema de personalização", desc: "A identidade visual do seu club", page: "recursos/sistema-de-personalizacao.html", icon: "fa-solid fa-paintbrush", grad: ["#ff5c71", "#e03a8d"], tsum: "tsum-personalizacao.webp" }
  ];

  var recursoGroups = [
    { id: "aluno", title: "Experiência do aluno" },
    { id: "vendas", title: "Vendas e crescimento" },
    { id: "seguranca", title: "Controle e segurança" }
  ];

  /* Integrações: [nome, arquivo do logo, cor inicial, cor final] */
  var gateways = [
    ["Hotmart", "hotmart.png", "#BF2E00", "#FFAA8F"], ["Eduzz", "eduzz.png", "#000C1F", "#0061F3"], ["Kiwify", "kiwify.png", "#108655", "#80ECBF"], ["Braip", "braip.png", "#5D1FED", "#B499F4"],
    ["PagSeguro", "pagseguro.png", "#006A57", "#42FFDD"], ["Mercado Pago", "mercadopago.png", "#004BBB", "#8FBBFF"], ["Asaas", "asaas.png", "#004BBB", "#8FBBFF"], ["Monetizze", "monetizze.png", "#019AFF", "#8FD2FF"],
    ["CartPanda", "cartpanda.png", "#0016A7", "#7F8FFF"], ["Ticto", "ticto.png", "#380655", "#AF43ED"], ["Converte", "converte.png", "#915000", "#FFBB69"], ["NexusPay", "nexuspay.png", "#FFFFFF", "#EEF0F3"],
    ["Guru Manager", "gurumanager.png", "#00715E", "#49FFE0"], ["AppMax", "appmax.png", "#060F23", "#2963D5"], ["Greenn", "greenn.png", "#00715E", "#49FFE0"], ["LastLink", "lastlink.png", "#FFFFFF", "#EEF0F3"],
    ["Abmex", "abmex.png", "#0A0A0C", "#36363C"], ["Yampi", "yampi.png", "#0E0423", "#5C1DE0"], ["PerfectPay", "perfectpay.png", "#FFFFFF", "#EEF0F3"], ["Hubla", "hubla.png", "#00715E", "#49FFE0"],
    ["CycloPay", "cyclopay.png", "#FFFFFF", "#EEF0F3"], ["ProviPay", "provipay.png", "#00349E", "#76A3FF"], ["EngagED", "engaged.png", "#FFFFFF", "#EEF0F3"], ["Doppus", "doppus.png", "#A65600", "#FFC07E"],
    ["HeroSpark", "herospark.png", "#FFFFFF", "#EEF0F3"], ["PayT", "payt.png", "#A65600", "#FFC07E"], ["Vimeo", "vimeo.png", "#019AFF", "#8FD2FF", "Streaming de Reprodução"], ["Panda vídeos", "pandavideos.png", "#FFFFFF", "#EEF0F3", "Streaming de Reprodução"],
    ["Google Analytics", "googleanalytics.png", "#D48300", "#FFD48F", "Pixel de Rastreamento"], ["Facebook Pixel", "facebookpixel.png", "#004BBB", "#8FBBFF", "Pixel de Rastreamento"], ["Hotjar", "hotjar.png", "#FFFFFF", "#EEF0F3", "Marketing"], ["Kirvano", "kirvano.svg", "#FFFFFF", "#EEF0F3"],
    ["Vega Checkout", "vegacheckout.svg", "#100038", "#5210FF"], ["Typebot", "typebot.png", "#002988", "#608FFF", "Atendimento"], ["AktaPay", "aktapay.svg", "#0C1609", "#53933E"], ["Crisp Chat", "crispchat.png", "#FFFFFF", "#EEF0F3", "Atendimento"],
    ["Intercom Chat", "intercomchat.png", "#FFFFFF", "#EEF0F3", "Atendimento"], ["Stripe", "stripe.svg", "#1409FF", "#948FFF"], ["B4You", "b4you.svg", "#002C5D", "#3593FF"], ["The Mart", "themart.svg", "#AD4500", "#FFB685"],
    ["Assiny", "assiny.png", "#3C0E5C", "#AC5DE3"], ["Cakto", "cakto.png", "#004931", "#21FFB4"], ["Iugu", "iugu.png", "#FFFFFF", "#EEF0F3"], ["Blitzpay", "blitzpay.png", "#0E0A15", "#6E4B9F"],
    ["TMB", "tmb.png", "#FFFFFF", "#EEF0F3"], ["Zouti", "zouti.png", "#FFFFFF", "#EEF0F3"], ["Octus Pay", "octuspay.png", "#00112E", "#0663FF"], ["Hopy Pay", "hopypay.svg", "#C1D4DE", "#B7CCD7"]
  ];

  /* Mega-menu "Integrações": nomes que aparecem em cada coluna (logo/cores vêm de gateways) */
  var integracoesMenu = [
    { title: "Plataformas de venda", twoCol: true, items: ["Hotmart", "Eduzz", "Kiwify", "Braip", "Monetizze", "Ticto", "PerfectPay", "LastLink", "Greenn", "Hubla", "Yampi", "Cakto"] },
    { title: "Pagamentos", items: ["Stripe", "Mercado Pago", "PagSeguro", "Asaas", "Iugu"], then: { title: "Vídeo", items: ["Vimeo", "Panda vídeos"] } },
    { title: "Marketing e atendimento", items: ["Facebook Pixel", "Google Analytics", "Hotjar", "Intercom Chat", "Crisp Chat", "Typebot", "EngagED"] }
  ];

  var ecossistemaMenu = [
    { title: "Aprenda", items: [
      { title: "Astron Academy", desc: "Aulas para crescer o seu negócio digital", href: "https://www.astronacademy.com.br/", icon: "fa-solid fa-graduation-cap", grad: ["#ff5a3d", "#e8402f"] },
      { title: "Blog da Astron", desc: "Conteúdos e novidades da plataforma", href: "https://blog.astronmembers.com.br", icon: "fa-solid fa-newspaper", grad: ["#5dadff", "#2488d4"] },
      { title: "Astron Pages", desc: "Landing pages sem sair da plataforma", href: "#", icon: "fa-solid fa-window-maximize", grad: ["#a99aff", "#7c5cff"] }
    ] },
    { title: "Aplicativo", items: [
      { title: "Google Play", desc: "Baixe para Android", href: "https://play.google.com/store/apps/details?id=com.gusgio.astronmembersmobile&hl=pt_BR&gl=US", icon: "fa-brands fa-google-play", grad: ["#22c55e", "#16a34a"] },
      { title: "App Store", desc: "Baixe para iPhone e iPad", href: "https://apps.apple.com/br/app/astron-members/id6450926255", icon: "fa-brands fa-apple", grad: ["#616668", "#3a3d3f"] }
    ] },
    { title: "Siga a Astron", items: [
      { title: "Instagram", desc: "@astronmembers", href: "https://www.instagram.com/astronmembers", icon: "fa-brands fa-instagram", grad: ["#e872bb", "#d93071"] },
      { title: "YouTube", desc: "Vídeos e tutoriais", href: "https://www.youtube.com/channel/UC5faB_EuY1m45J3-YkSLgeQ", icon: "fa-brands fa-youtube", grad: ["#ff5a3d", "#c41e1e"] }
    ] }
  ];

  /* CRM do mockup do hero */
  var pipeline = [
    { title: "criaram uma conta F...", count: 35, dot: "#e91e8c", people: [["Ana Souza", "ana.souza"], ["Bruno Lima", "bruno.lima"], ["Carla Melo", "carla.melo"], ["Diego Rocha", "diego.rocha"], ["Elisa Ramos", "elisa.ramos"], ["Felipe Nunes", "felipe.nunes"], ["Gabriela Dias", "gabriela.dias"]] },
    { title: "clientes chamados", count: 7, dot: "#9b4de0", people: [["Hugo Barros", "hugo.barros"], ["Isabela Cunha", "isabela.cunha"], ["João Pereira", "joao.pereira"]] },
    { title: "Concluiu Módulo 1", count: 6, tone: "blue", badge: "100% do Módulo 1 assistido", people: [["Karina Alves", "karina.alves"], ["Lucas Fontes", "lucas.fontes"], ["Mariana Teixeira", "mariana.teixeira"]] },
    { title: "Quer o Módulo 2", count: 5, tone: "gold", badge: "Alta intenção de compra", people: [["Nathan Moraes", "nathan.moraes"], ["Olívia Castro", "olivia.castro"], ["Pedro Azevedo", "pedro.azevedo"]] }
  ];

  var clientLogos = ["instituto-libano-logo.png", "despertar-digital-logo.png", "conteudo-fechado-logo.webp", "power-bi-experience-logo.png", "afiliagram-logo.png", "zap-facil-logo.webp"];

  var CTA = CENTRAL + "cadastrar?on=members";

  /* Cards de "Todas as ferramentas" — o detalhe abre num <dialog> */
  var tools = [
    { title: "Vitrine estilo streaming", cat: "Vitrine", color: "#e59da0", img: "academy-showcase.webp", pill: "Mais usada", page: "recursos/vitrine-estilo-netflix.html",
      desc: "Uma área de membros com visual de streaming: capas em carrossel, módulos organizados e um painel administrativo intuitivo, com a identidade do seu negócio.",
      points: ["Capas em carrossel que convidam o aluno a continuar assistindo.", "Cores, logo e identidade visual do seu club.", "Vídeos protegidos contra cópia e download (DRM)."] },
    { title: "CRM Nativo pra acompanhar cada lead, sem planilha", cat: "CRM", color: "#2488d4", img: "recursos/crm-pipeline.webp", page: "recursos/crm.html",
      desc: "Acompanhe o funil de cada aluno num quadro de pipelines, do primeiro clique até a venda, sem planilha e sem ferramenta externa.",
      points: ["Pipelines visuais: arraste o card pra mudar o estágio do lead.", "Cada ação do aluno atualiza o funil sozinha.", "Tudo dentro da Astron, sem CRM externo."] },
    { title: "Hospede seus vídeos sem custo de ferramenta externa", cat: "Vídeos", color: "#7c5cff", img: "lesson-video-frame.webp", play: true, page: "recursos/hospedagem-de-videos.html",
      desc: "Suas aulas em vídeo ficam hospedadas direto na Astron, sem custo extra de ferramenta externa, já protegidas contra cópia e download.",
      points: ["Upload direto pela plataforma, sem integração externa.", "Proteção contra cópia e download (DRM) já incluída.", "Sem custo por armazenamento de vídeo em serviço terceiro."] },
    { title: "Avise o aluno na hora, direto pelo app", cat: "Notificações", color: "#e8402f", scene: "push", page: "recursos/notificacoes-push.html",
      desc: "Envie um aviso e ele aparece na tela do celular do aluno na hora, mesmo com o app fechado, sem depender de e-mail ou WhatsApp.",
      points: ["Chega na tela do celular, mesmo com o app fechado.", "Envie pra todo mundo ou só pra quem parou de acessar.", "Aumenta o retorno à área de membros sem gastar em anúncio."] },
    { title: "Comunidades privadas pra promover conexão entre alunos", cat: "Comunidades", color: "#da1a47", img: "recursos/comunidades-tela.webp", page: "recursos/comunidades.html",
      desc: "Comunidades privadas dentro da sua área de membros para promover conexão entre os alunos e manter a turma engajada.",
      points: ["Um espaço de troca onde os alunos conversam e se ajudam.", "A conexão entre os alunos mantém todo mundo ativo.", "Tudo em um só lugar, sem plugin e sem rede social externa."] },
    { title: "Tags e pixels pra otimizar sua estratégia de marketing", cat: "Tags e Pixels", color: "#3ec9a7", logos: ["facebookpixel.png", "googleanalytics.png", "hotjar.png"], page: "recursos/tags-e-pixels.html",
      desc: "Gerencie tags e pixels do seu club e otimize a sua estratégia de marketing, sem plugin.",
      points: ["Tags e pixels estratégicos para as suas campanhas.", "Facebook Pixel, Google Analytics e Hotjar integrados.", "Tudo nativo dentro da Astron, sem integração externa."] },
    { title: "Aplicativo próprio, iOS e Android, pro seu aluno estudar de qualquer lugar", cat: "Aplicativo", color: "#a34aa3", img: "recursos/app-aparelhos.webp", page: "recursos/aplicativo.html",
      desc: "Seu aluno estuda de qualquer lugar com o aplicativo próprio da Astron Members, disponível para iOS e Android.",
      points: ["Disponível no Google Play e na App Store.", "O aluno acessa as aulas direto do celular.", "Área de membros no bolso: progresso, comunidade e certificados."] },
    { title: "Certificados que valorizam a jornada do aluno", cat: "Certificados", color: "#c9973f", img: "recursos/certificado.webp", page: "recursos/central-de-certificados.html",
      desc: "Emita certificados para os seus alunos e valorize a jornada de quem conclui os seus cursos.",
      points: ["Central de certificados para gerenciar tudo em um só lugar.", "O aluno recebe o certificado ao finalizar o curso.", "Uma entrega que reforça a qualidade do seu produto."] },
    { title: "Planos e cobrança do seu jeito", cat: "Planos e vendas", color: "#ff5c71", logos: ["hotmart.png", "eduzz.png", "kiwify.png"], page: "recursos/criacao-de-multiplanos.html",
      desc: "Monte planos de acesso, capte dados na inscrição e venda com mais de 50 gateways nativos, pagando apenas pelos usuários ativos no último mês.",
      points: ["Multiplanos: vários planos e níveis de acesso para o mesmo club.", "Formulários de inscrição para captar os dados do aluno na entrada.", "Cobrança por uso: você só paga por usuário ativo nos últimos 30 dias."] },
    { title: "Integre com as plataformas que você já usa", cat: "Integrações", color: "#24bbd6", logos: ["stripe.svg", "vimeo.png", "typebot.png", "mercadopago.png", "ticto.png", "hubla.png"], page: "#integracoes", pageLabel: "Ver todas as integrações",
      desc: "Conecte a Astron às plataformas de venda, pagamentos, vídeo, marketing e atendimento que você já usa, sem plugin e sem integração externa.",
      points: ["Hotmart, Eduzz, Kiwify, Braip, Monetizze e mais.", "Stripe, Mercado Pago, PagSeguro, Asaas e iugu.", "Vimeo, Panda Vídeos, Facebook Pixel, Google Analytics, Hotjar, Intercom e Crisp."] }
  ];

  /* Atalhos da barra de ferramentas (ícone → recurso) */
  var toolBar = ["vitrine", "crm", "app", "comunidades", "certificados", "idiomas", "multiplanos", "formularios", "importacao", "tags", "drm", "admins", "termos", "personalizacao"];
  // Ícones Lucide (traço 1.7) usados só na barra "Todas as ferramentas", como no original
  var toolBarIcons = {
    vitrine: '<path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/>',
    crm: '<path d="M5 3v14"/><path d="M12 3v8"/><path d="M19 3v18"/>',
    app: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    comunidades: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
    certificados: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    idiomas: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    multiplanos: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    formularios: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    importacao: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/>',
    tags: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
    drm: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    admins: '<path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m14.305 16.53.923-.382"/><path d="m15.228 13.852-.923-.383"/><path d="m16.852 12.228-.383-.923"/><path d="m16.852 17.772-.383.924"/><path d="m19.148 12.228.383-.923"/><path d="m19.53 18.696-.382-.924"/><path d="m20.772 13.852.924-.383"/><path d="m20.772 16.148.924.383"/><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/>',
    termos: '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    personalizacao: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>'
  };

  var testimonials = [
    { yt: "Bn9Dgt0Onpw", img: "murilo-henrique.webp", name: "Murilo Henrique", role: "Produtor Digital", quote: "Para mim, a melhor área de membros." },
    { yt: "tn_FOKd5p3U", img: "thiago-lima.webp", name: "Thiago Lima", role: "Produtor Digital com mais de 1M de seguidores", quote: "Ter cuidado em cada detalhe, fez meu produto valer muito mais, mas só consegui com a Astron." },
    { yt: "UBEE4OnQ5qQ", img: "gabriel-juste.webp", name: "Gabriel Juste", role: "Produtor Digital", quote: "Já estou há mais de 1 ano, e é maravilhosa, parece uma Netflix!" },
    { yt: "Eu1CKfRSUXY", img: "tiago-rabelo.webp", name: "Tiago Rabelo", role: "Produtor Digital", quote: "Já tive várias plataformas, mas quando conheci a Astron, não precisei de mais nenhuma!" },
    { yt: "_lWuebnTikI", img: "tito-antonio.webp", name: "Tito Antônio", role: "Dono da Convenção Digital", quote: "Astron Members é a melhor, sem mais!" },
    { yt: "feDn98TGr0A", img: "leonardo-karpinski.webp", name: "Leonardo Karpinski", role: "Produtor Digital", quote: "Recomendo fortemente a Astron." },
    { yt: "LgUrU1Usnq4", img: "carla-vitti.webp", name: "Carla Vitti", role: "Produtora Digital", quote: "Mudou meu produto para melhor, sem dúvidas!" }
  ];

  /* Planos (mensalidade fixa por faixa de leads ativos) — usados pelo slider e pelo gráfico */
  var plans = [
    { name: "Grátis", max: 10, monthly: 5, rate: null },
    { name: "Starter", max: 200, monthly: 147, rate: 0.74 },
    { name: "Professional", max: 500, monthly: 297, rate: 0.59 },
    { name: "Scale", max: 1000, monthly: 587, rate: 0.59 },
    { name: "Enterprise", max: Infinity, monthly: 1197, rate: null, unlimited: true }
  ];

  window.ASTRON = {
    IMG: IMG, SITE: SITE, CENTRAL: CENTRAL, CTA: CTA,
    recursos: recursos, recursoGroups: recursoGroups, gateways: gateways,
    integracoesMenu: integracoesMenu, ecossistemaMenu: ecossistemaMenu,
    pipeline: pipeline, clientLogos: clientLogos, tools: tools, toolBar: toolBar, toolBarIcons: toolBarIcons,
    testimonials: testimonials, plans: plans
  };
})();
