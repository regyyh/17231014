const http = require('http');
const fs = require('fs');
const path = require('path');

let discordClient = null;
let botState = 'offline'; // 'offline' | 'starting' | 'online'
let startBotFn = null;

function setClient(client) {
    discordClient = client;
    botState = 'online';
}

function setStartBotFn(fn) {
    startBotFn = fn;
}

function getBotStatus() {
    if (botState === 'online' && discordClient && discordClient.isReady()) {
        return {
            state: 'online',
            online: true,
            tag: discordClient.user.tag,
            guilds: discordClient.guilds.cache.size,
            ping: discordClient.ws.ping
        };
    }
    if (botState === 'starting') {
        return { state: 'starting', online: false, tag: null, guilds: 0, ping: null };
    }
    return { state: 'offline', online: false, tag: null, guilds: 0, ping: null };
}

const HTML = (status) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dados Assimilados — Status</title>
  <link rel="icon" type="image/png" href="/favicon.png"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0d0d1a;
      color: #e0e0f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .card {
      background: #16162a;
      border: 1px solid #2a2a50;
      border-radius: 16px;
      padding: 2.5rem 3rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }

    .icon img {
      width: 90px;
      height: 90px;
      object-fit: contain;
      margin-bottom: 1rem;
      border-radius: 12px;
    }

    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: #ffffff;
    }

    .subtitle {
      font-size: 0.9rem;
      color: #7070a0;
      margin-bottom: 2rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.2rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .badge.online  { background: #0d2e1a; border: 1.5px solid #22c55e; color: #22c55e; }
    .badge.offline { background: #2e0d0d; border: 1.5px solid #ef4444; color: #ef4444; }
    .badge.starting{ background: #1e1a0d; border: 1.5px solid #f59e0b; color: #f59e0b; }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: currentColor;
      animation: ${status.state === 'online' ? 'pulse 2s infinite' : status.state === 'starting' ? 'pulse 0.8s infinite' : 'none'};
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      text-align: left;
      margin-bottom: 1.5rem;
    }

    .stat {
      background: #0d0d1a;
      border: 1px solid #2a2a50;
      border-radius: 10px;
      padding: 0.75rem 1rem;
    }

    .stat-label {
      font-size: 0.72rem;
      color: #7070a0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.2rem;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: #c0c0e0;
    }

    .btn-start {
      width: 100%;
      padding: 0.85rem 1.5rem;
      border-radius: 10px;
      border: none;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      margin-top: 0.25rem;
    }

    .btn-start:active { transform: scale(0.97); }
    .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-start.state-offline  { background: #22c55e; color: #0a0a0a; }
    .btn-start.state-starting { background: #f59e0b; color: #0a0a0a; }
    .btn-start.state-online   { background: #2a2a50; color: #7070a0; cursor: default; }

    .msg-box {
      margin-top: 1rem;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 500;
      display: none;
    }

    .msg-box.success { background: #0d2e1a; border: 1px solid #22c55e; color: #22c55e; }
    .msg-box.warn    { background: #1e1a0d; border: 1px solid #f59e0b; color: #f59e0b; }
    .msg-box.error   { background: #2e0d0d; border: 1px solid #ef4444; color: #ef4444; }

    footer {
      margin-top: 2.5rem;
      font-size: 0.75rem;
      color: #3a3a60;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <img src="/favicon.png" alt="Dados Assimilados"/>
    </div>
    <h1>Dados Assimilados</h1>
    <p class="subtitle">Discord Bot — Sistema de RPG</p>

    <div class="badge ${status.state}" id="badge">
      <span class="dot"></span>
      <span id="badge-text">${status.state === 'online' ? 'Online' : status.state === 'starting' ? 'Ligando…' : 'Offline'}</span>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-label">Bot</div>
        <div class="stat-value" id="stat-tag">${status.tag || '—'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Servidores</div>
        <div class="stat-value" id="stat-guilds">${status.guilds || '—'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Ping (WebSocket)</div>
        <div class="stat-value" id="stat-ping">${status.ping != null ? status.ping + ' ms' : '—'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Estado</div>
        <div class="stat-value" id="stat-state">${status.state === 'online' ? 'Online' : status.state === 'starting' ? 'Iniciando' : 'Offline'}</div>
      </div>
    </div>

    <button
      class="btn-start state-${status.state}"
      id="btn-start"
      onclick="ligarBot()"
      ${status.state !== 'offline' ? 'disabled' : ''}
    >
      ${status.state === 'online' ? '✅ Bot já está online' : status.state === 'starting' ? '⏳ Ligando…' : '▶ Ligar Bot'}
    </button>

    <div class="msg-box" id="msg-box"></div>
  </div>

  <footer id="footer">Esta página atualiza automaticamente • ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</footer>

  <script>
    let pooling = null;

    function showMsg(text, type) {
      const el = document.getElementById('msg-box');
      el.className = 'msg-box ' + type;
      el.textContent = text;
      el.style.display = 'block';
      clearTimeout(el._hide);
      el._hide = setTimeout(() => { el.style.display = 'none'; }, 6000);
    }

    async function ligarBot() {
      const btn = document.getElementById('btn-start');
      btn.disabled = true;
      btn.textContent = '⏳ Enviando…';

      try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();

        if (data.result === 'started') {
          showMsg('✅ Bot está sendo ligado! Aguarde alguns segundos.', 'success');
          startPolling();
        } else if (data.result === 'already_starting') {
          showMsg('⏳ O bot já está sendo ligado por outra pessoa. Aguarde!', 'warn');
          startPolling();
        } else if (data.result === 'already_online') {
          showMsg('✅ O bot já está online!', 'success');
        } else if (data.result === 'no_token') {
          showMsg('❌ Token do Discord não configurado no servidor.', 'error');
          btn.disabled = false;
          btn.textContent = '▶ Ligar Bot';
        }
      } catch (e) {
        showMsg('❌ Erro ao comunicar com o servidor.', 'error');
        btn.disabled = false;
        btn.textContent = '▶ Ligar Bot';
      }
    }

    function applyStatus(s) {
      const badge = document.getElementById('badge');
      const badgeText = document.getElementById('badge-text');
      const btn = document.getElementById('btn-start');

      badge.className = 'badge ' + s.state;
      document.getElementById('stat-tag').textContent = s.tag || '—';
      document.getElementById('stat-guilds').textContent = s.guilds || '—';
      document.getElementById('stat-ping').textContent = s.ping != null ? s.ping + ' ms' : '—';
      document.getElementById('stat-state').textContent =
        s.state === 'online' ? 'Online' : s.state === 'starting' ? 'Iniciando' : 'Offline';
      badgeText.textContent = s.state === 'online' ? 'Online' : s.state === 'starting' ? 'Ligando…' : 'Offline';

      btn.className = 'btn-start state-' + s.state;
      if (s.state === 'offline') {
        btn.disabled = false;
        btn.textContent = '▶ Ligar Bot';
      } else if (s.state === 'starting') {
        btn.disabled = true;
        btn.textContent = '⏳ Ligando…';
      } else {
        btn.disabled = true;
        btn.textContent = '✅ Bot já está online';
      }
    }

    function startPolling() {
      if (pooling) return;
      pooling = setInterval(async () => {
        try {
          const res = await fetch('/health');
          const data = await res.json();
          applyStatus(data);
          if (data.state === 'online') {
            clearInterval(pooling);
            pooling = null;
          }
        } catch (e) {}
      }, 3000);
    }

    // Se o bot já estava starting ao carregar a página, inicia polling
    if ('${status.state}' === 'starting') startPolling();
  </script>
</body>
</html>`;

const ICON_PATH = path.join(__dirname, 'public', 'favicon.png');

function startServer() {
    const PORT = process.env.PORT || 3000;

    const server = http.createServer((req, res) => {
        if (req.url === '/favicon.png' || req.url === '/favicon.ico') {
            try {
                const img = fs.readFileSync(ICON_PATH);
                res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' });
                return res.end(img);
            } catch {
                res.writeHead(404);
                return res.end();
            }
        }

        if (req.url === '/health') {
            const status = getBotStatus();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true, ...status }));
        }

        if (req.url === '/api/start' && req.method === 'POST') {
            const current = getBotStatus();

            if (current.state === 'online') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ result: 'already_online' }));
            }

            if (current.state === 'starting') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ result: 'already_starting' }));
            }

            if (!startBotFn) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ result: 'no_token' }));
            }

            if (!process.env.DISCORD_TOKEN) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ result: 'no_token' }));
            }

            botState = 'starting';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result: 'started' }));

            startBotFn().catch((err) => {
                console.error('[Bot] Erro ao fazer login:', err.message);
                botState = 'offline';
            });

            return;
        }

        const status = getBotStatus();
        const html = HTML(status);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    server.listen(PORT, () => {
        console.log(`[Web] Servidor de status rodando na porta ${PORT}`);
    });
}

module.exports = { startServer, setClient, setStartBotFn };
