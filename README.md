# Aludra Condos Portaria

Painel da portaria — para porteiros e vigilantes.

## Stack

- React 18 + TypeScript
- Vite + Tailwind
- React Query (server state)
- Zustand (auth/local state)
- React Router
- SignalR (`@microsoft/signalr`) para tempo real

## Telas

| Rota                | Descrição                                                        |
|---------------------|------------------------------------------------------------------|
| `/login`            | Login JWT                                                        |
| `/`                 | Dashboard com KPIs, câmeras, acessos em tempo real, alertas      |
| `/acessos`          | Validação de QR Code + histórico paginado                        |
| `/visitantes`       | Convites com QR e aprovação                                      |
| `/encomendas`       | Recebimento e retirada (assinatura digital pronta para wire-up)  |
| `/pessoas`          | Busca de moradores/prestadores/funcionários                      |
| `/dispositivos`     | Status de câmeras, leitores, cancelas + acionamento remoto       |
| `/ocorrencias`      | Abertura, classificação e follow-up                              |

## Como rodar

```bash
npm install
VITE_API_URL=http://localhost:5080 npm run dev
# abre em http://localhost:5173
```

Login de seed: `porteiro@condflow.com` / `Aludra@123`.

## SignalR

Conecta automaticamente em `${VITE_API_URL}/hubs/portaria`. O Dashboard escuta:
- `acesso:novo` → injeta no feed
- `alerta:critico` → faixa vermelha no topo
- `dispositivo:status` → atualiza saúde

## Próximos passos

- Streaming RTSP→HLS para câmeras (atualmente placeholder)
- Captura LPR e biometria a partir do Edge Agent
- Modo offline completo (Service Worker + IndexedDB)
- Multi-condomínio (seleção por usuário Administradora)
