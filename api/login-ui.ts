import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const ip = url.searchParams.get('ip') || '';
  const next = url.searchParams.get('next') || '/';

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Autenticação Necessária</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu; background: #0b0b0c; color: #fafafa; margin:0; }
      .wrap { max-width: 480px; margin: 10vh auto; padding: 24px; background: #111; border: 1px solid #222; border-radius: 12px; }
      h1 { font-size: 1.5rem; margin: 0 0 12px; }
      label { display:block; margin: 12px 0 6px; }
      input[type=text], input[type=password] { width:100%; padding: 10px 12px; border-radius:8px; border:1px solid #333; background:#0e0e10; color:#fafafa; }
      .row { display:flex; align-items:center; gap:8px; margin-top: 10px; }
      button { background:#e5b100; color:#111; border:none; padding:10px 16px; border-radius: 8px; font-weight:600; cursor:pointer; margin-top: 16px; }
      .muted { color:#aaa; font-size: .9rem; }
      .error { color:#ff6b6b; margin-top:8px; }
      .success { color:#9be69b; margin-top:8px; }
      .note { background:#141414; border:1px solid #222; padding:10px; border-radius:8px; }
      a { color:#e5b100; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Verificação de acesso remoto</h1>
      <p class="note">Detectamos um novo acesso do IP <strong>${ip}</strong>. Faça login para continuar e, opcionalmente, marque este IP como confiável.</p>
      <form id="loginForm">
        <label>Usuário</label>
        <input name="username" type="text" autocomplete="username" required />
        <label>Senha</label>
        <input name="password" type="password" autocomplete="current-password" required />
        <div class="row">
          <input id="remember" name="remember" type="checkbox" />
          <label for="remember" style="margin:0">Lembrar este IP por 90 dias</label>
        </div>
        <button type="submit">Entrar</button>
        <div id="msg" class="muted"></div>
      </form>
      <p class="muted" style="margin-top:16px">Gerencie IPs confiáveis em <a href="/api/login-ui?manage=1">Configurações</a>.</p>
    </div>
    <script type="module">
      const form = document.getElementById('loginForm');
      const msg = document.getElementById('msg');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Autenticando...';
        const fd = new FormData(form);
        const remember = fd.get('remember') === 'on';
        const payload = {
          username: fd.get('username'),
          password: fd.get('password'),
          remember,
          ip: ${JSON.stringify(ip)}
        };
        try {
          const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
          const data = await res.json();
          if (!res.ok) {
            msg.textContent = data.error || 'Falha na autenticação';
            msg.className = 'error';
            return;
          }
          msg.textContent = 'Autenticado. Redirecionando...';
          msg.className = 'success';
          window.location.href = ${JSON.stringify(next)};
        } catch (err) {
          msg.textContent = 'Erro inesperado. Tente novamente.';
          msg.className = 'error';
        }
      });
    </script>
  </body>
</html>`;

  // Settings page to list/remove trusted IPs
  if (url.searchParams.get('manage') === '1') {
    const manageHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IPs Confiáveis</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu; background: #0b0b0c; color: #fafafa; margin:0; }
      .wrap { max-width: 720px; margin: 6vh auto; padding: 24px; }
      h1 { font-size: 1.7rem; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #222; padding: 10px; }
      button { background:#e5b100; color:#111; border:none; padding:8px 12px; border-radius: 8px; font-weight:600; cursor:pointer; }
      .muted { color:#aaa; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Gerenciar IPs Confiáveis</h1>
      <p class="muted">Remova IPs ou adicione manualmente um novo IP confiável.</p>
      <div>
        <label>Novo IP</label>
        <input id="newIp" type="text" placeholder="0.0.0.0" />
        <button id="addBtn">Adicionar</button>
      </div>
      <table>
        <thead><tr><th>IP</th><th>Expira em</th><th>Ações</th></tr></thead>
        <tbody id="rows"><tr><td colspan="3" class="muted">Carregando...</td></tr></tbody>
      </table>
    </div>
    <script type="module">
      const rows = document.getElementById('rows');
      async function load() {
        rows.innerHTML = '<tr><td colspan="3" class="muted">Carregando...</td></tr>';
        const res = await fetch('/api/trusted-ips');
        const data = await res.json();
        rows.innerHTML = '';
        (data.ips || []).forEach((e) => {
          const tr = document.createElement('tr');
          const tdIp = document.createElement('td'); tdIp.textContent = e.ip;
          const tdExp = document.createElement('td'); tdExp.textContent = new Date(e.exp).toLocaleString();
          const tdActions = document.createElement('td');
          const btn = document.createElement('button'); btn.textContent = 'Remover';
          btn.onclick = async () => { await fetch('/api/trusted-ips?ip=' + encodeURIComponent(e.ip), { method: 'DELETE' }); load(); };
          tdActions.appendChild(btn);
          tr.append(tdIp, tdExp, tdActions);
          rows.appendChild(tr);
        });
        if (!rows.childElementCount) {
          const tr = document.createElement('tr');
          const td = document.createElement('td'); td.colSpan = 3; td.className = 'muted'; td.textContent = 'Nenhum IP confiável cadastrado.';
          tr.appendChild(td); rows.appendChild(tr);
        }
      }
      document.getElementById('addBtn').onclick = async () => {
        const ip = (document.getElementById('newIp') as HTMLInputElement).value.trim();
        if (!ip) return;
        await fetch('/api/trusted-ips', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ ip, days: 90 }) });
        (document.getElementById('newIp') as HTMLInputElement).value='';
        load();
      };
      load();
    </script>
  </body>
</html>`;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.status(200).send(manageHtml);
  }

  res.setHeader('content-type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}

