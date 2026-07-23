# TFX Creative Lab

Site institucional de uma agência de tecnologia e design (landing page SPA de página única).

## Tecnologias
- HTML5 + Tailwind CSS (via CDN)
- Fontes: Clash Display + Inter (Fontshare)
- Ícones: Lucide (CDN)
- JavaScript puro (navegação SPA entre Home e detalhes de serviço, sem framework)

## Estrutura
- `index.html` — site completo (markup + estilos + scripts em um arquivo)

## Deploy
Site estático publicado em:

**🔗 https://turiyaterapiaholistica-eng.github.io/tfx-creative-lab**

- **GitHub Pages**: ativo (Source: `main` / root). Republica automático a cada push.
- **Vercel / Netlify** (opcional): importar o repositório, build command vazio, publish dir `.`

## Pendências conhecidas (ajustar antes de produção)
- ✅ WhatsApp real configurado (`5511978386533`).
- ⚠️ Formulário de contato: estruturado para Formspree via `fetch`, mas o `action` do `<form id="contact-form">` ainda tem placeholder `https://formspree.io/f/SEU_ID_AQUI`. Trocar pela URL real do seu form no Formspree para enviar leads de verdade.
- ⚠️ Imagens vêm do Unsplash via hotlink — recomenda-se baixar para `/assets` para estabilidade/offline.
- ⚠️ Tailwind/Fontes/Lucide vêm de CDN — requer internet para renderizar 100%.
