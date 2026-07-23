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
Site estático. Pode ser hospedado em:
- **GitHub Pages**: Settings → Pages → Source: `main` / root
- **Vercel / Netlify**: importar o repositório, build command vazio, publish dir `.`

## Pendências conhecidas (ajustar antes de produção)
- Substituir o placeholder do WhatsApp (`5500000000000`) pelo número real.
- O formulário de contato usa `alert()` (não envia dados de verdade) — ligar a um backend/Formspree/Resend.
- Imagens vêm do Unsplash via hotlink — recomenda-se baixar para `/assets` para estabilidade/offline.
- Tailwind/Fontes/Lucide vêm de CDN — requer internet para renderizar 100%.
