/* =====================================================
   RM Gesso — Sistema de Gestão  |  script.js
   ===================================================== */

// ── ETAPAS DE OBRA ─────────────────────────────────
const ETAPAS = ['Orçamento','Aprovado','Em execução','Acabamento','Entregue'];

// ── DADOS DE EXEMPLO ───────────────────────────────
const EXEMPLO = {
  clientes: [
    { id:'c1', nome:'João Silva',         telefone:'(19) 99123-4567', endereco:'Rua das Acácias, 123 – Piracicaba/SP', obs:'Paga em dia.', criadoEm:'2024-01-10' },
    { id:'c2', nome:'Maria Fernanda',     telefone:'(19) 98765-4321', endereco:'Av. Brasil, 456 – Piracicaba/SP',     obs:'Prefere WhatsApp.', criadoEm:'2024-03-05' },
    { id:'c3', nome:'Carlos Construções', telefone:'(19) 3322-1100',  endereco:'Rua Boa Vista, 789 – Americana/SP',  obs:'Empresa parceira.', criadoEm:'2024-05-20' },
  ],
  servicos: [
    { id:'s1', nome:'Gesso Liso',        tipo:'servico',  unidade:'m²', custo:18,  venda:32 },
    { id:'s2', nome:'Drywall 12,5mm',    tipo:'material', unidade:'m²', custo:28,  venda:45 },
    { id:'s3', nome:'Forro PVC',         tipo:'material', unidade:'m²', custo:22,  venda:38 },
    { id:'s4', nome:'Aplicação Drywall', tipo:'servico',  unidade:'m²', custo:15,  venda:35 },
    { id:'s5', nome:'Mão de obra Forro', tipo:'servico',  unidade:'m²', custo:12,  venda:28 },
    { id:'s6', nome:'Perfil de Aço',     tipo:'material', unidade:'un', custo:8.5, venda:14 },
  ],
  obras: [
    {
      id:'o1', nome:'Reforma Residencial – João Silva', clienteId:'c1',
      dataInicio:'2025-01-15', dataFim:'2025-02-28', status:'finalizada', etapa:5,
      itens:[
        { id:'i1', servicoId:'s2', quantidade:40 },
        { id:'i2', servicoId:'s4', quantidade:40 },
        { id:'i3', servicoId:'s1', quantidade:20 },
      ],
      pagamentos:[
        { id:'p1', data:'2025-01-20', valor:2000, forma:'pix',          obs:'Entrada' },
        { id:'p2', data:'2025-03-01', valor:2400, forma:'transferencia', obs:'Final'  },
      ],
    },
    {
      id:'o2', nome:'Forro PVC – Maria Fernanda', clienteId:'c2',
      dataInicio:'2025-04-01', dataFim:'', status:'andamento', etapa:3,
      itens:[
        { id:'i4', servicoId:'s3', quantidade:30 },
        { id:'i5', servicoId:'s5', quantidade:30 },
      ],
      pagamentos:[{ id:'p3', data:'2025-04-05', valor:800, forma:'dinheiro', obs:'Sinal' }],
    },
    {
      id:'o3', nome:'Galpão Industrial – Carlos Construções', clienteId:'c3',
      dataInicio:'2025-05-01', dataFim:'', status:'orcamento', etapa:1,
      itens:[
        { id:'i6', servicoId:'s2', quantidade:120 },
        { id:'i7', servicoId:'s4', quantidade:120 },
        { id:'i8', servicoId:'s6', quantidade:200 },
      ],
      pagamentos:[],
    },
  ],
  despesas: [
    { id:'d1', nome:'Combustível – Caminhonete', valor:350,  data:'2025-04-15', categoria:'transporte' },
    { id:'d2', nome:'Salário Ajudante – Março',  valor:1800, data:'2025-03-31', categoria:'funcionario' },
    { id:'d3', nome:'Parafusos e fixadores',     valor:120,  data:'2025-04-10', categoria:'material' },
    { id:'d4', nome:'Aluguel Galpão',            valor:600,  data:'2025-04-01', categoria:'outros' },
  ],
};

// ── STORAGE ────────────────────────────────────────
const DB = {
  get(k)   { try { return JSON.parse(localStorage.getItem('rmgesso_'+k)); } catch { return null; } },
  set(k,v) { localStorage.setItem('rmgesso_'+k, JSON.stringify(v)); },
  load()   { return { clientes:this.get('clientes')||[], servicos:this.get('servicos')||[], obras:this.get('obras')||[], despesas:this.get('despesas')||[] }; },
  save(d)  { this.set('clientes',d.clientes); this.set('servicos',d.servicos); this.set('obras',d.obras); this.set('despesas',d.despesas); },
};

let state = DB.load();
if (!state.clientes.length && !state.servicos.length) {
  state = JSON.parse(JSON.stringify(EXEMPLO));
  DB.save(state);
}

// ── UTILS ──────────────────────────────────────────
const uid     = () => '_' + Math.random().toString(36).slice(2,9);
const fmt     = v  => 'R$ ' + (v||0).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fmtData = d  => { if(!d) return '—'; const [y,m,day]=d.split('-'); return `${day}/${m}/${y}`; };
const getC    = id => state.clientes.find(c=>c.id===id) || { nome:'—' };
const getS    = id => state.servicos.find(s=>s.id===id) || { nome:'—', custo:0, venda:0, unidade:'' };

function calcObra(o) {
  let custo=0, venda=0;
  (o.itens||[]).forEach(it=>{ const s=getS(it.servicoId); custo+=s.custo*it.quantidade; venda+=s.venda*it.quantidade; });
  const recebido=(o.pagamentos||[]).reduce((a,p)=>a+p.valor,0);
  return { custo, venda, lucro:venda-custo, recebido, restante:venda-recebido };
}

function toast(msg, tipo='success') {
  const el=document.getElementById('toast');
  el.textContent=msg; el.className=`toast ${tipo} show`;
  setTimeout(()=>{ el.className='toast'; },2800);
}

// ── MODAL ──────────────────────────────────────────
function openModal(titulo, html) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML    = html;
  document.getElementById('modalBackdrop').classList.add('show');
}
function closeModal() { document.getElementById('modalBackdrop').classList.remove('show'); }

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalBackdrop').onclick = e => {
  if (e.target===document.getElementById('modalBackdrop')) closeModal();
};

// ── SIDEBAR ────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
document.getElementById('hamburger').onclick   = ()=>{ sidebar.classList.add('open'); overlay.classList.add('show'); };
document.getElementById('sidebarClose').onclick = closeSidebar;
overlay.onclick = closeSidebar;
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

// ── NAVEGAÇÃO ──────────────────────────────────────
const PAGES = { dashboard:renderDashboard, orcamentos:renderOrcamentos, obras:renderObras, clientes:renderClientes, servicos:renderServicos, financeiro:renderFinanceiro, despesas:renderDespesas };
const TITLES = { dashboard:'Dashboard', orcamentos:'Orçamentos', obras:'Obras', clientes:'Clientes', servicos:'Serviços & Materiais', financeiro:'Financeiro', despesas:'Despesas' };
let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active', el.dataset.page===page));
  document.getElementById('topbarTitle').textContent  = TITLES[page];
  document.getElementById('topbarActions').innerHTML  = '';
  closeSidebar();
  PAGES[page]?.();
}
document.querySelectorAll('.nav-item').forEach(el=>{ el.onclick=e=>{ e.preventDefault(); navigate(el.dataset.page); }; });

document.getElementById('btnExport').onclick = () => {
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  a.download=`rmgesso_${new Date().toISOString().slice(0,10)}.json`; a.click(); toast('Dados exportados!');
};

// ── HELPERS ────────────────────────────────────────
function statusBadge(s) {
  return ({andamento:'<span class="badge badge-blue">Em andamento</span>',finalizada:'<span class="badge badge-green">Finalizada</span>',orcamento:'<span class="badge badge-gold">Orçamento</span>'})[s]||'';
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function renderDashboard() {
  const andamento=state.obras.filter(o=>o.status==='andamento').length;
  let tV=0,tC=0,tR=0,tRest=0;
  state.obras.forEach(o=>{ const c=calcObra(o); tV+=c.venda; tC+=c.custo; tR+=c.recebido; tRest+=c.restante; });
  const tDes=state.despesas.reduce((a,d)=>a+d.valor,0);
  const tLucro=tV-tC;

  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Visão Geral</h1><p>Bem-vindo ao sistema RM Gesso</p></div>
      <button class="btn btn-gold" onclick="navigate('orcamentos')">+ Novo Orçamento</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card s-blue"><div class="stat-icon i-blue">🏗️</div><div class="stat-label">Em Andamento</div><div class="stat-value c-blue">${andamento}</div><div class="stat-sub">${state.obras.filter(o=>o.status==='finalizada').length} finalizada(s)</div></div>
      <div class="stat-card s-gold"><div class="stat-icon i-gold">📋</div><div class="stat-label">Total Orçado</div><div class="stat-value c-gold">${fmt(tV)}</div><div class="stat-sub">${state.obras.length} obra(s)</div></div>
      <div class="stat-card s-green"><div class="stat-icon i-green">💰</div><div class="stat-label">Lucro Bruto</div><div class="stat-value c-green">${fmt(tLucro)}</div><div class="stat-sub">Todas as obras</div></div>
      <div class="stat-card s-orange"><div class="stat-icon i-orange">⏳</div><div class="stat-label">A Receber</div><div class="stat-value">${fmt(tRest)}</div><div class="stat-sub">Pendente</div></div>
      <div class="stat-card s-red"><div class="stat-icon i-red">📉</div><div class="stat-label">Despesas</div><div class="stat-value c-red">${fmt(tDes)}</div><div class="stat-sub">${state.despesas.length} lançamento(s)</div></div>
    </div>
    <div class="dash-grid">
      <div class="card">
        <div class="card-title">📋 Obras Recentes</div>
        ${state.obras.length===0
          ? '<div class="empty-state"><div class="empty-icon">🏗️</div><p>Nenhuma obra</p></div>'
          : state.obras.slice(-6).reverse().map(o=>{ const c=calcObra(o); return `<div class="dash-list-item"><span class="name">${o.nome}</span>${statusBadge(o.status)}<span class="val">${fmt(c.venda)}</span></div>`; }).join('')
        }
      </div>
      <div class="card">
        <div class="card-title">📊 Andamento das Obras</div>
        ${state.obras.filter(o=>o.status==='andamento').length===0
          ? '<div class="empty-state"><p>Sem obras em andamento</p></div>'
          : state.obras.filter(o=>o.status==='andamento').map(o=>{ const e=o.etapa||1, pct=Math.round(((e-1)/(ETAPAS.length-1))*100); return `<div style="margin-bottom:14px;"><div class="flex-between"><span style="font-size:13px;font-weight:500;">${o.nome}</span><span class="badge badge-blue">${ETAPAS[e-1]}</span></div><div class="progress-bar" style="margin-top:6px;"><div class="progress-fill" style="width:${pct}%"></div></div><div class="text-muted" style="margin-top:3px;">${pct}% concluído</div></div>`; }).join('')
        }
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// ORÇAMENTOS
// ══════════════════════════════════════════════════════
function renderOrcamentos() {
  const orcs = state.obras.filter(o=>o.status==='orcamento');
  document.getElementById('topbarActions').innerHTML = `<button class="btn btn-gold" id="btnNovoOrc">+ Novo Orçamento</button>`;
  document.getElementById('content').innerHTML = `
    <div class="page-header"><div><h1>Orçamentos</h1><p>${orcs.length} em aberto</p></div></div>
    ${orcs.length===0
      ? `<div class="card"><div class="empty-state"><div class="empty-icon">📋</div><p>Nenhum orçamento em aberto.<br>Clique em "+ Novo Orçamento" para começar.</p></div></div>`
      : orcs.map(o=>buildOrcCard(o)).join('')
    }
    <div class="section-title" style="margin-top:28px;">Convertidos em Obra</div>
    ${state.obras.filter(o=>o.status!=='orcamento').length===0
      ? '<p class="text-muted">Nenhum ainda.</p>'
      : `<div class="table-wrap"><table>
          <thead><tr><th>Nome</th><th>Cliente</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
          <tbody>${state.obras.filter(o=>o.status!=='orcamento').map(o=>{ const c=calcObra(o); return `<tr><td><strong>${o.nome}</strong></td><td>${getC(o.clienteId).nome}</td><td>${statusBadge(o.status)}</td><td class="fw-6 c-blue">${fmt(c.venda)}</td><td><button class="btn-icon btn-sm" onclick="verObra('${o.id}')">👁 Ver</button></td></tr>`; }).join('')}</tbody>
        </table></div>`
    }
  `;
  document.getElementById('btnNovoOrc').onclick = ()=>formOrcamento();
}

function buildOrcCard(o) {
  const c=calcObra(o), cl=getC(o.clienteId);
  return `
    <div class="orc-card">
      <div class="orc-card-header">
        <div>
          <div class="orc-card-title">${o.nome}</div>
          <div class="orc-card-sub">👤 ${cl.nome} &nbsp;|&nbsp; 📅 ${fmtData(o.dataInicio)}</div>
        </div>
        <div style="text-align:right;">
          <div class="orc-card-total">${fmt(c.venda)}</div>
          <div class="text-muted" style="font-size:11px;">custo: ${fmt(c.custo)}</div>
        </div>
      </div>
      <button style="margin-top:10px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;padding:0;" onclick="toggleItens('orcItens-${o.id}', this)">▸ Ver itens</button>
      <div id="orcItens-${o.id}" class="orc-card-items">
        <table style="width:100%;font-size:12.5px;">
          <thead><tr><th>Serviço/Material</th><th>Qtd</th><th>Und</th><th>Custo</th><th>Venda</th></tr></thead>
          <tbody>${o.itens.map(it=>{ const s=getS(it.servicoId); return `<tr><td><strong>${s.nome}</strong></td><td>${it.quantidade}</td><td>${s.unidade}</td><td class="c-red">${fmt(s.custo*it.quantidade)}</td><td class="c-blue fw-6">${fmt(s.venda*it.quantidade)}</td></tr>`; }).join('')}</tbody>
          <tfoot><tr><td colspan="3"><strong>Total</strong></td><td class="c-red"><strong>${fmt(c.custo)}</strong></td><td class="c-blue fw-6">${fmt(c.venda)}</td></tr></tfoot>
        </table>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="formOrcamento('${o.id}')">✏ Editar</button>
        <button class="btn btn-gold btn-sm" onclick="converterParaObra('${o.id}')">✓ Converter em Obra</button>
        <button class="btn-share whats" onclick="compartilharWhats('${o.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.854l6.158-1.616A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.372l-.36-.213-3.714.974.99-3.626-.235-.373A9.818 9.818 0 1 1 12 21.818z"/></svg>
          WhatsApp
        </button>
        <button class="btn-share print" onclick="imprimirOrcamento('${o.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir / PDF
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirObra('${o.id}')">🗑</button>
      </div>
    </div>`;
}

function toggleItens(id, btn) {
  const el=document.getElementById(id);
  const open=el.classList.toggle('open');
  btn.textContent=(open?'▾':'▸')+' Ver itens';
}

// Itens temporários do formulário de orçamento
window._tmpItens = [];

function formOrcamento(id=null) {
  const o = id ? state.obras.find(x=>x.id===id) : {};
  window._tmpItens = JSON.parse(JSON.stringify(o.itens||[]));

  const clienteOpts = state.clientes.map(c=>`<option value="${c.id}" ${o.clienteId===c.id?'selected':''}>${c.nome}</option>`).join('');
  const srvOpts = state.servicos.map(s=>`<option value="${s.id}">${s.nome} (${s.unidade}) — ${fmt(s.venda)}</option>`).join('');

  openModal(id?'Editar Orçamento':'Novo Orçamento', `
    <div class="form-group"><label>Nome / Identificação *</label>
      <input id="oNome" value="${o.nome||''}" placeholder="Ex: Residência Rua Brasil – Sala e Quarto"/>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Cliente *</label>
        <select id="oCliente"><option value="">— Selecione —</option>${clienteOpts}</select>
      </div>
      <div class="form-group"><label>Data</label>
        <input id="oData" type="date" value="${o.dataInicio||new Date().toISOString().slice(0,10)}"/>
      </div>
    </div>

    <hr class="divider"/>
    <div class="section-title">Itens do Orçamento</div>
    <div id="tmpItensContainer">${buildTmpItens()}</div>

    <div style="display:grid;grid-template-columns:2fr 90px auto;gap:8px;margin-top:10px;align-items:end;">
      <div class="form-group" style="margin:0;"><label>Serviço / Material</label><select id="addSrv">${srvOpts}</select></div>
      <div class="form-group" style="margin:0;"><label>Quantidade</label><input id="addQtd" type="number" min="0.01" step="0.01" value="1"/></div>
      <button class="btn btn-primary btn-sm" style="align-self:flex-end;" onclick="tmpAddItem()">+ Add</button>
    </div>

    <div style="margin-top:14px;padding:12px 16px;background:var(--off-white);border-radius:8px;border:1px solid var(--border);">
      <div class="flex-between"><span class="text-muted">Custo total</span><strong id="rCusto" class="c-red">—</strong></div>
      <div class="flex-between mt-8"><span class="text-muted">Valor de venda</span><strong id="rVenda" class="c-blue font-serif" style="font-size:20px;">—</strong></div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-gold" onclick="salvarOrcamento('${id||''}')">Salvar Orçamento</button>
    </div>
  `);
  atualizarResumo();
}

function buildTmpItens() {
  if (!window._tmpItens.length) return '<p class="text-muted" id="semItens">Nenhum item adicionado.</p>';
  return window._tmpItens.map(it=>{ const s=getS(it.servicoId); return `
    <div class="item-row" id="trow-${it.id}">
      <strong>${s.nome}</strong>
      <span>${it.quantidade} ${s.unidade}</span>
      <span class="c-red">${fmt(s.custo*it.quantidade)}</span>
      <span class="c-blue fw-6">${fmt(s.venda*it.quantidade)}</span>
      <button class="btn-icon btn-sm" onclick="tmpRmItem('${it.id}')">✕</button>
    </div>`; }).join('');
}

function tmpAddItem() {
  const servicoId = document.getElementById('addSrv').value;
  const quantidade = parseFloat(document.getElementById('addQtd').value)||0;
  if (!servicoId||quantidade<=0) { toast('Selecione e informe a quantidade!','error'); return; }
  window._tmpItens.push({ id:uid(), servicoId, quantidade });
  document.getElementById('tmpItensContainer').innerHTML = buildTmpItens();
  document.getElementById('addQtd').value='1';
  atualizarResumo();
}

function tmpRmItem(itemId) {
  window._tmpItens = window._tmpItens.filter(i=>i.id!==itemId);
  document.getElementById('tmpItensContainer').innerHTML = buildTmpItens();
  atualizarResumo();
}

function atualizarResumo() {
  let custo=0, venda=0;
  window._tmpItens.forEach(it=>{ const s=getS(it.servicoId); custo+=s.custo*it.quantidade; venda+=s.venda*it.quantidade; });
  const rc=document.getElementById('rCusto'), rv=document.getElementById('rVenda');
  if (rc) rc.textContent=fmt(custo);
  if (rv) rv.textContent=fmt(venda);
}

function salvarOrcamento(id) {
  const nome=document.getElementById('oNome').value.trim();
  const clienteId=document.getElementById('oCliente').value;
  if (!nome)     { toast('Nome obrigatório!','error'); return; }
  if (!clienteId){ toast('Selecione um cliente!','error'); return; }
  const obj = { nome, clienteId, dataInicio:document.getElementById('oData').value, dataFim:'', status:'orcamento', etapa:1, itens:[...window._tmpItens], pagamentos:[] };
  if (id) {
    const idx=state.obras.findIndex(o=>o.id===id);
    state.obras[idx]={ ...state.obras[idx], ...obj, pagamentos:state.obras[idx].pagamentos||[] };
    toast('Orçamento atualizado!');
  } else {
    state.obras.push({ id:uid(), ...obj });
    toast('Orçamento criado!');
  }
  DB.save(state); closeModal(); renderOrcamentos();
}

function converterParaObra(id) {
  const o=state.obras.find(x=>x.id===id);
  if (!confirm(`Converter "${o.nome}" em obra em andamento?`)) return;
  const idx=state.obras.findIndex(x=>x.id===id);
  state.obras[idx].status='andamento'; state.obras[idx].etapa=2;
  state.obras[idx].dataInicio=state.obras[idx].dataInicio||new Date().toISOString().slice(0,10);
  DB.save(state); toast('Convertido em obra!'); renderOrcamentos();
}

// ══════════════════════════════════════════════════════
// OBRAS
// ══════════════════════════════════════════════════════
function renderObras(filtroStatus='todos') {
  let lista=state.obras;
  if (filtroStatus!=='todos') lista=lista.filter(o=>o.status===filtroStatus);
  document.getElementById('topbarActions').innerHTML=`
    <select id="filtroObra" class="btn btn-secondary" style="cursor:pointer;font-size:13px;">
      <option value="todos"     ${filtroStatus==='todos'?'selected':''}>Todas</option>
      <option value="andamento" ${filtroStatus==='andamento'?'selected':''}>Em andamento</option>
      <option value="finalizada"${filtroStatus==='finalizada'?'selected':''}>Finalizadas</option>
      <option value="orcamento" ${filtroStatus==='orcamento'?'selected':''}>Orçamentos</option>
    </select>
    <button class="btn btn-primary" id="btnAddObra">+ Nova Obra</button>
  `;
  document.getElementById('content').innerHTML=`
    <div class="page-header"><div><h1>Obras</h1><p>${lista.length} obra(s)</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Obra</th><th>Cliente</th><th>Status</th><th>Etapa</th><th>Orçamento</th><th>Recebido</th><th>Lucro</th><th>Ações</th></tr></thead>
      <tbody>
        ${lista.length===0
          ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏗️</div><p>Nenhuma obra</p></div></td></tr>`
          : lista.map(o=>{ const cl=getC(o.clienteId),c=calcObra(o); return `<tr>
              <td><strong>${o.nome}</strong></td>
              <td>${cl.nome}</td>
              <td>${statusBadge(o.status)}</td>
              <td><span class="badge badge-gray">${ETAPAS[(o.etapa||1)-1]}</span></td>
              <td class="fw-6">${fmt(c.venda)}</td>
              <td class="c-green">${fmt(c.recebido)}</td>
              <td class="${c.lucro>=0?'c-green':'c-red'} fw-6">${fmt(c.lucro)}</td>
              <td><div style="display:flex;gap:6px;">
                <button class="btn-icon" onclick="verObra('${o.id}')">👁</button>
                <button class="btn-icon" onclick="formObra('${o.id}')">✏️</button>
                <button class="btn-icon" onclick="excluirObra('${o.id}')">🗑</button>
              </div></td>
            </tr>`; }).join('')
        }
      </tbody>
    </table></div>
  `;
  document.getElementById('btnAddObra').onclick=()=>formObra();
  document.getElementById('filtroObra').onchange=e=>renderObras(e.target.value);
}

function formObra(id=null) {
  const o=id?state.obras.find(x=>x.id===id):{};
  const cOpts=state.clientes.map(c=>`<option value="${c.id}" ${o.clienteId===c.id?'selected':''}>${c.nome}</option>`).join('');
  const eOpts=ETAPAS.map((e,i)=>`<option value="${i+1}" ${(o.etapa||1)===i+1?'selected':''}>${e}</option>`).join('');
  openModal(id?'Editar Obra':'Nova Obra',`
    <div class="form-group"><label>Nome *</label><input id="oNome" value="${o.nome||''}" placeholder="Ex: Reforma Sala – Rua X"/></div>
    <div class="form-row">
      <div class="form-group"><label>Cliente</label><select id="oCliente"><option value="">— Selecione —</option>${cOpts}</select></div>
      <div class="form-group"><label>Status</label>
        <select id="oStatus">
          <option value="orcamento"  ${o.status==='orcamento'?'selected':''}>Orçamento</option>
          <option value="andamento"  ${o.status==='andamento'?'selected':''}>Em andamento</option>
          <option value="finalizada" ${o.status==='finalizada'?'selected':''}>Finalizada</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data Início</label><input id="oIni" type="date" value="${o.dataInicio||''}"/></div>
      <div class="form-group"><label>Data Término</label><input id="oFim" type="date" value="${o.dataFim||''}"/></div>
    </div>
    <div class="form-group"><label>Etapa de Andamento</label><select id="oEtapa">${eOpts}</select></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarObra('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarObra(id) {
  const nome=document.getElementById('oNome').value.trim();
  if(!nome){toast('Nome obrigatório!','error');return;}
  const obj={ nome, clienteId:document.getElementById('oCliente').value, status:document.getElementById('oStatus').value, dataInicio:document.getElementById('oIni').value, dataFim:document.getElementById('oFim').value, etapa:parseInt(document.getElementById('oEtapa').value)||1 };
  if(id){const idx=state.obras.findIndex(o=>o.id===id); state.obras[idx]={...state.obras[idx],...obj}; toast('Atualizado!');}
  else{state.obras.push({id:uid(),...obj,itens:[],pagamentos:[]}); toast('Obra criada!');}
  DB.save(state); closeModal(); renderObras();
}

function excluirObra(id) {
  if(!confirm('Excluir esta obra?'))return;
  state.obras=state.obras.filter(o=>o.id!==id);
  DB.save(state); toast('Removida.','info');
  currentPage==='orcamentos' ? renderOrcamentos() : renderObras();
}

function verObra(id) {
  const o=state.obras.find(x=>x.id===id);
  const cl=getC(o.clienteId), c=calcObra(o);
  const pct=c.venda>0?Math.min((c.recebido/c.venda)*100,100).toFixed(0):0;
  const etapa=o.etapa||1;
  const sOpts=state.servicos.map(s=>`<option value="${s.id}">${s.nome} (${s.unidade})</option>`).join('');

  openModal(`Obra: ${o.nome}`,`
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px;">
      <div><div class="text-muted">Cliente</div><strong>${cl.nome}</strong></div>
      <div><div class="text-muted">Status</div>${statusBadge(o.status)}</div>
      <div><div class="text-muted">Início</div><strong>${fmtData(o.dataInicio)}</strong></div>
      ${o.dataFim?`<div><div class="text-muted">Fim</div><strong>${fmtData(o.dataFim)}</strong></div>`:''}
    </div>

    <div class="section-title">Etapas de Andamento</div>
    <div class="andamento-steps">
      ${ETAPAS.map((e,i)=>{ const n=i+1,cls=n<etapa?'done':(n===etapa?'active':''); return `<div class="step ${cls}"><div class="step-dot">${n<etapa?'✓':n}</div><div class="step-label">${e}</div></div>`; }).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
      ${etapa>1?`<button class="btn btn-secondary btn-sm" onclick="moverEtapa('${o.id}',-1)">◀ Voltar etapa</button>`:''}
      ${etapa<ETAPAS.length?`<button class="btn btn-primary btn-sm" onclick="moverEtapa('${o.id}',1)">Próxima etapa ▶</button>`:''}
    </div>

    <div class="section-title" style="margin-top:18px;">Resumo Financeiro</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">
      <div class="card" style="padding:12px;text-align:center;"><div class="stat-label">Custo</div><div class="font-serif c-red" style="font-size:17px;">${fmt(c.custo)}</div></div>
      <div class="card" style="padding:12px;text-align:center;"><div class="stat-label">Orçamento</div><div class="font-serif c-blue" style="font-size:17px;">${fmt(c.venda)}</div></div>
      <div class="card" style="padding:12px;text-align:center;"><div class="stat-label">Lucro</div><div class="font-serif c-green" style="font-size:17px;">${fmt(c.lucro)}</div></div>
    </div>
    <div class="flex-between"><span class="text-muted">Recebimento: ${pct}%</span><span class="text-muted">${fmt(c.recebido)} / ${fmt(c.venda)}</span></div>
    <div class="progress-bar"><div class="progress-fill gold" style="width:${pct}%"></div></div>
    <div class="flex-between mt-8" style="font-size:12px;">
      <span>Recebido: <strong class="c-green">${fmt(c.recebido)}</strong></span>
      <span>Restante: <strong class="c-gold">${fmt(c.restante)}</strong></span>
    </div>

    <div class="section-title" style="margin-top:18px;">Serviços & Materiais</div>
    <div id="listaItens">${itensHTML(o)}</div>
    <div style="display:grid;grid-template-columns:2fr 80px auto;gap:8px;margin-top:8px;align-items:end;">
      <div class="form-group" style="margin:0;"><label>Serviço</label><select id="addSrv">${sOpts}</select></div>
      <div class="form-group" style="margin:0;"><label>Qtd</label><input id="addQtd" type="number" value="1" min="0.01" step="0.01"/></div>
      <button class="btn btn-primary btn-sm" style="align-self:flex-end;" onclick="addItem('${o.id}')">+ Add</button>
    </div>

    <div class="section-title" style="margin-top:18px;">Pagamentos</div>
    <div id="listaPag">${pagHTML(o)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-top:8px;align-items:end;">
      <div class="form-group" style="margin:0;"><label>Data</label><input id="pagData" type="date" value="${new Date().toISOString().slice(0,10)}"/></div>
      <div class="form-group" style="margin:0;"><label>Valor</label><input id="pagValor" type="number" step="0.01" placeholder="0,00"/></div>
      <div class="form-group" style="margin:0;"><label>Forma</label>
        <select id="pagForma"><option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="transferencia">Transferência</option><option value="cartao">Cartão</option></select>
      </div>
      <button class="btn btn-gold btn-sm" style="align-self:flex-end;" onclick="addPag('${o.id}')">+ Add</button>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary" onclick="formObra('${o.id}')">✏ Editar Dados</button>
    </div>
  `);
}

function itensHTML(o) {
  if (!o.itens.length) return '<p class="text-muted">Nenhum item.</p>';
  return o.itens.map(it=>{ const s=getS(it.servicoId); return `<div class="item-row"><strong>${s.nome}</strong><span>${it.quantidade} ${s.unidade}</span><span class="c-red">${fmt(s.custo*it.quantidade)}</span><span class="c-blue fw-6">${fmt(s.venda*it.quantidade)}</span><button class="btn-icon btn-sm" onclick="rmItem('${o.id}','${it.id}')">✕</button></div>`; }).join('');
}

function pagHTML(o) {
  if (!o.pagamentos.length) return '<p class="text-muted">Nenhum pagamento.</p>';
  return o.pagamentos.map(pg=>`<div class="pag-row"><span>${fmtData(pg.data)}</span><span class="badge badge-blue">${pg.forma}</span><strong class="c-green">${fmt(pg.valor)}</strong><button class="btn-icon btn-sm" onclick="rmPag('${o.id}','${pg.id}')">✕</button></div>`).join('');
}

function addItem(oId) {
  const sId=document.getElementById('addSrv').value, q=parseFloat(document.getElementById('addQtd').value)||0;
  if(!sId||q<=0){toast('Selecione e informe quantidade!','error');return;}
  const idx=state.obras.findIndex(o=>o.id===oId);
  state.obras[idx].itens.push({id:uid(),servicoId:sId,quantidade:q});
  DB.save(state); document.getElementById('listaItens').innerHTML=itensHTML(state.obras[idx]); toast('Item adicionado!'); renderObras();
}

function rmItem(oId,iId) {
  const idx=state.obras.findIndex(o=>o.id===oId);
  state.obras[idx].itens=state.obras[idx].itens.filter(i=>i.id!==iId);
  DB.save(state); document.getElementById('listaItens').innerHTML=itensHTML(state.obras[idx]); toast('Removido.','info'); renderObras();
}

function addPag(oId) {
  const data=document.getElementById('pagData').value, valor=parseFloat(document.getElementById('pagValor').value)||0, forma=document.getElementById('pagForma').value;
  if(!data||valor<=0){toast('Preencha data e valor!','error');return;}
  const idx=state.obras.findIndex(o=>o.id===oId);
  state.obras[idx].pagamentos.push({id:uid(),data,valor,forma});
  DB.save(state); document.getElementById('listaPag').innerHTML=pagHTML(state.obras[idx]); document.getElementById('pagValor').value=''; toast('Pagamento registrado!'); renderObras();
}

function rmPag(oId,pId) {
  const idx=state.obras.findIndex(o=>o.id===oId);
  state.obras[idx].pagamentos=state.obras[idx].pagamentos.filter(p=>p.id!==pId);
  DB.save(state); document.getElementById('listaPag').innerHTML=pagHTML(state.obras[idx]); toast('Removido.','info'); renderObras();
}

function moverEtapa(oId, delta) {
  const idx=state.obras.findIndex(o=>o.id===oId);
  const nova=Math.max(1,Math.min(ETAPAS.length,(state.obras[idx].etapa||1)+delta));
  state.obras[idx].etapa=nova;
  if(nova===ETAPAS.length) state.obras[idx].status='finalizada';
  else if(nova>=2) state.obras[idx].status='andamento';
  DB.save(state); closeModal(); toast(`Etapa: ${ETAPAS[nova-1]}`); verObra(oId); renderObras();
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════
function renderClientes(filtro='') {
  const lista=state.clientes.filter(c=>c.nome.toLowerCase().includes(filtro.toLowerCase())||c.telefone.includes(filtro));
  document.getElementById('topbarActions').innerHTML=`<div class="search-bar"><input id="sch" placeholder="Buscar..." value="${filtro}"/></div><button class="btn btn-primary" id="btnAdd">+ Adicionar</button>`;
  document.getElementById('content').innerHTML=`
    <div class="page-header"><div><h1>Clientes</h1><p>${lista.length} cadastrado(s)</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Nome</th><th>Telefone</th><th>Endereço</th><th>Obras</th><th>Ações</th></tr></thead>
      <tbody>
        ${lista.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👤</div><p>Nenhum cliente</p></div></td></tr>`:lista.map(c=>{ const n=state.obras.filter(o=>o.clienteId===c.id).length; return `<tr><td><strong>${c.nome}</strong></td><td>${c.telefone||'—'}</td><td>${c.endereco||'—'}</td><td><span class="badge badge-blue">${n} obra(s)</span></td><td><div style="display:flex;gap:6px;"><button class="btn-icon" onclick="formCliente('${c.id}')">✏️</button><button class="btn-icon" onclick="excluirCliente('${c.id}')">🗑</button></div></td></tr>`; }).join('')}
      </tbody>
    </table></div>
  `;
  document.getElementById('btnAdd').onclick=()=>formCliente();
  document.getElementById('sch').oninput=e=>renderClientes(e.target.value);
}

function formCliente(id=null) {
  const c=id?state.clientes.find(x=>x.id===id):{};
  openModal(id?'Editar Cliente':'Novo Cliente',`
    <div class="form-group"><label>Nome *</label><input id="cNome" value="${c.nome||''}" placeholder="Nome completo"/></div>
    <div class="form-row">
      <div class="form-group"><label>Telefone</label><input id="cTel" value="${c.telefone||''}" placeholder="(19) 99999-0000"/></div>
      <div class="form-group"><label>Cadastrado em</label><input id="cData" type="date" value="${c.criadoEm||new Date().toISOString().slice(0,10)}"/></div>
    </div>
    <div class="form-group"><label>Endereço</label><input id="cEnd" value="${c.endereco||''}" placeholder="Rua, nº, bairro, cidade"/></div>
    <div class="form-group"><label>Observações</label><textarea id="cObs">${c.obs||''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarCliente('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarCliente(id) {
  const nome=document.getElementById('cNome').value.trim();
  if(!nome){toast('Nome obrigatório!','error');return;}
  const obj={nome,telefone:document.getElementById('cTel').value,endereco:document.getElementById('cEnd').value,obs:document.getElementById('cObs').value,criadoEm:document.getElementById('cData').value};
  if(id){const idx=state.clientes.findIndex(c=>c.id===id);state.clientes[idx]={...state.clientes[idx],...obj};toast('Atualizado!');}
  else{state.clientes.push({id:uid(),...obj});toast('Cliente adicionado!');}
  DB.save(state);closeModal();renderClientes();
}

function excluirCliente(id){
  if(!confirm('Excluir este cliente?'))return;
  state.clientes=state.clientes.filter(c=>c.id!==id);
  DB.save(state);toast('Removido.','info');renderClientes();
}

// ══════════════════════════════════════════════════════
// SERVIÇOS & MATERIAIS
// ══════════════════════════════════════════════════════
function renderServicos(filtro='') {
  const lista=state.servicos.filter(s=>s.nome.toLowerCase().includes(filtro.toLowerCase()));
  document.getElementById('topbarActions').innerHTML=`<div class="search-bar"><input id="sch" placeholder="Buscar..." value="${filtro}"/></div><button class="btn btn-primary" id="btnAdd">+ Adicionar</button>`;
  document.getElementById('content').innerHTML=`
    <div class="page-header"><div><h1>Serviços & Materiais</h1><p>${lista.length} item(ns) cadastrado(s)</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Nome</th><th>Tipo</th><th>Unidade</th><th>Custo/un</th><th>Venda/un</th><th>Margem</th><th>Ações</th></tr></thead>
      <tbody>
        ${lista.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>Nenhum item</p></div></td></tr>`:lista.map(s=>{ const m=s.custo>0?((s.venda-s.custo)/s.custo*100).toFixed(0):0; return `<tr><td><strong>${s.nome}</strong></td><td><span class="badge ${s.tipo==='servico'?'badge-blue':'badge-gold'}">${s.tipo==='servico'?'Serviço':'Material'}</span></td><td>${s.unidade}</td><td class="c-red">${fmt(s.custo)}</td><td class="c-green fw-6">${fmt(s.venda)}</td><td><span class="badge badge-green">+${m}%</span></td><td><div style="display:flex;gap:6px;"><button class="btn-icon" onclick="formServico('${s.id}')">✏️</button><button class="btn-icon" onclick="excluirServico('${s.id}')">🗑</button></div></td></tr>`; }).join('')}
      </tbody>
    </table></div>
  `;
  document.getElementById('btnAdd').onclick=()=>formServico();
  document.getElementById('sch').oninput=e=>renderServicos(e.target.value);
}

function formServico(id=null) {
  const s=id?state.servicos.find(x=>x.id===id):{};
  openModal(id?'Editar Item':'Novo Serviço / Material',`
    <div class="form-group"><label>Nome *</label><input id="sNome" value="${s.nome||''}" placeholder="Ex: Gesso Liso, Forro PVC..."/></div>
    <div class="form-row">
      <div class="form-group"><label>Tipo</label><select id="sTipo"><option value="servico" ${s.tipo==='servico'?'selected':''}>Serviço</option><option value="material" ${s.tipo==='material'?'selected':''}>Material</option></select></div>
      <div class="form-group"><label>Unidade</label><select id="sUnid"><option value="m²" ${s.unidade==='m²'?'selected':''}>m²</option><option value="m" ${s.unidade==='m'?'selected':''}>metro</option><option value="un" ${s.unidade==='un'?'selected':''}>Unidade</option><option value="kg" ${s.unidade==='kg'?'selected':''}>kg</option><option value="saco" ${s.unidade==='saco'?'selected':''}>Saco</option><option value="h" ${s.unidade==='h'?'selected':''}>Hora</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Custo/un (R$)</label><input id="sCusto" type="number" step="0.01" value="${s.custo||''}"/></div>
      <div class="form-group"><label>Venda/un (R$)</label><input id="sVenda" type="number" step="0.01" value="${s.venda||''}"/></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarServico('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarServico(id) {
  const nome=document.getElementById('sNome').value.trim();
  if(!nome){toast('Nome obrigatório!','error');return;}
  const obj={nome,tipo:document.getElementById('sTipo').value,unidade:document.getElementById('sUnid').value,custo:parseFloat(document.getElementById('sCusto').value)||0,venda:parseFloat(document.getElementById('sVenda').value)||0};
  if(id){const idx=state.servicos.findIndex(s=>s.id===id);state.servicos[idx]={...state.servicos[idx],...obj};toast('Atualizado!');}
  else{state.servicos.push({id:uid(),...obj});toast('Adicionado!');}
  DB.save(state);closeModal();renderServicos();
}

function excluirServico(id){
  if(!confirm('Excluir?'))return;
  state.servicos=state.servicos.filter(s=>s.id!==id);
  DB.save(state);toast('Removido.','info');renderServicos();
}

// ══════════════════════════════════════════════════════
// FINANCEIRO
// ══════════════════════════════════════════════════════
function renderFinanceiro() {
  let tV=0,tC=0,tR=0,tRest=0;
  state.obras.forEach(o=>{const c=calcObra(o);tV+=c.venda;tC+=c.custo;tR+=c.recebido;tRest+=c.restante;});
  const tDes=state.despesas.reduce((a,d)=>a+d.valor,0), tL=tV-tC, liq=tL-tDes;
  document.getElementById('content').innerHTML=`
    <div class="page-header"><div><h1>Financeiro</h1><p>Análise completa</p></div></div>
    <div class="stats-grid">
      <div class="stat-card s-blue"><div class="stat-icon i-blue">📈</div><div class="stat-label">Faturamento</div><div class="stat-value c-blue">${fmt(tV)}</div></div>
      <div class="stat-card s-red"><div class="stat-icon i-red">📉</div><div class="stat-label">Custo Total</div><div class="stat-value c-red">${fmt(tC)}</div></div>
      <div class="stat-card s-gold"><div class="stat-icon i-gold">💰</div><div class="stat-label">Lucro Bruto</div><div class="stat-value c-gold">${fmt(tL)}</div></div>
      <div class="stat-card s-green"><div class="stat-icon i-green">✓</div><div class="stat-label">Recebido</div><div class="stat-value c-green">${fmt(tR)}</div></div>
      <div class="stat-card s-orange"><div class="stat-icon i-orange">⏳</div><div class="stat-label">A Receber</div><div class="stat-value">${fmt(tRest)}</div></div>
      <div class="stat-card ${liq>=0?'s-green':'s-red'}"><div class="stat-icon ${liq>=0?'i-green':'i-red'}">⚖️</div><div class="stat-label">Resultado Líquido</div><div class="stat-value ${liq>=0?'c-green':'c-red'}">${fmt(liq)}</div><div class="stat-sub">Lucro − despesas</div></div>
    </div>
    <div class="section-title">Por Obra</div>
    <div class="table-wrap"><table>
      <thead><tr><th>Obra</th><th>Cliente</th><th>Status</th><th>Orçamento</th><th>Custo</th><th>Lucro</th><th>Recebido</th><th>Restante</th></tr></thead>
      <tbody>${state.obras.map(o=>{const cl=getC(o.clienteId),c=calcObra(o);return `<tr><td><strong>${o.nome}</strong></td><td>${cl.nome}</td><td>${statusBadge(o.status)}</td><td>${fmt(c.venda)}</td><td class="c-red">${fmt(c.custo)}</td><td class="${c.lucro>=0?'c-green':'c-red'} fw-6">${fmt(c.lucro)}</td><td class="c-green">${fmt(c.recebido)}</td><td class="c-gold">${fmt(c.restante)}</td></tr>`;}).join('')}</tbody>
      <tfoot><tr><td colspan="3"><strong>TOTAL</strong></td><td><strong>${fmt(tV)}</strong></td><td class="c-red"><strong>${fmt(tC)}</strong></td><td class="c-green fw-6">${fmt(tL)}</td><td class="c-green"><strong>${fmt(tR)}</strong></td><td class="c-gold"><strong>${fmt(tRest)}</strong></td></tr></tfoot>
    </table></div>
  `;
}

// ══════════════════════════════════════════════════════
// DESPESAS
// ══════════════════════════════════════════════════════
function renderDespesas(filtro='') {
  const lista=state.despesas.filter(d=>d.nome.toLowerCase().includes(filtro.toLowerCase())||d.categoria.includes(filtro));
  const total=lista.reduce((a,d)=>a+d.valor,0);
  document.getElementById('topbarActions').innerHTML=`<div class="search-bar"><input id="sch" placeholder="Buscar..." value="${filtro}"/></div><button class="btn btn-primary" id="btnAdd">+ Adicionar</button>`;
  document.getElementById('content').innerHTML=`
    <div class="page-header"><div><h1>Despesas</h1><p>Total: <strong class="c-red">${fmt(total)}</strong></p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th><th>Ações</th></tr></thead>
      <tbody>
        ${lista.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💸</div><p>Nenhuma despesa</p></div></td></tr>`:lista.slice().reverse().map(d=>`<tr><td><strong>${d.nome}</strong></td><td><span class="badge ${catBadge(d.categoria)}">${d.categoria}</span></td><td>${fmtData(d.data)}</td><td class="c-red fw-6">${fmt(d.valor)}</td><td><div style="display:flex;gap:6px;"><button class="btn-icon" onclick="formDespesa('${d.id}')">✏️</button><button class="btn-icon" onclick="excluirDespesa('${d.id}')">🗑</button></div></td></tr>`).join('')}
      </tbody>
    </table></div>
  `;
  document.getElementById('btnAdd').onclick=()=>formDespesa();
  document.getElementById('sch').oninput=e=>renderDespesas(e.target.value);
}

function catBadge(c){return{material:'badge-gold',transporte:'badge-blue',funcionario:'badge-gray',outros:'badge-gray'}[c]||'badge-gray';}

function formDespesa(id=null){
  const d=id?state.despesas.find(x=>x.id===id):{};
  openModal(id?'Editar Despesa':'Nova Despesa',`
    <div class="form-group"><label>Descrição *</label><input id="dNome" value="${d.nome||''}" placeholder="Ex: Combustível..."/></div>
    <div class="form-row">
      <div class="form-group"><label>Valor (R$) *</label><input id="dValor" type="number" step="0.01" value="${d.valor||''}"/></div>
      <div class="form-group"><label>Data *</label><input id="dData" type="date" value="${d.data||new Date().toISOString().slice(0,10)}"/></div>
    </div>
    <div class="form-group"><label>Categoria</label>
      <select id="dCat">
        <option value="material"    ${d.categoria==='material'?'selected':''}>Material</option>
        <option value="transporte"  ${d.categoria==='transporte'?'selected':''}>Transporte</option>
        <option value="funcionario" ${d.categoria==='funcionario'?'selected':''}>Funcionário</option>
        <option value="outros"      ${d.categoria==='outros'?'selected':''}>Outros</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarDespesa('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarDespesa(id){
  const nome=document.getElementById('dNome').value.trim(), valor=parseFloat(document.getElementById('dValor').value)||0, data=document.getElementById('dData').value;
  if(!nome||valor<=0||!data){toast('Preencha todos os campos!','error');return;}
  const obj={nome,valor,data,categoria:document.getElementById('dCat').value};
  if(id){const idx=state.despesas.findIndex(d=>d.id===id);state.despesas[idx]={...state.despesas[idx],...obj};toast('Atualizado!');}
  else{state.despesas.push({id:uid(),...obj});toast('Adicionado!');}
  DB.save(state);closeModal();renderDespesas();
}

function excluirDespesa(id){
  if(!confirm('Excluir?'))return;
  state.despesas=state.despesas.filter(d=>d.id!==id);
  DB.save(state);toast('Removido.','info');renderDespesas();
}

// ══════════════════════════════════════════════════════
// ORÇAMENTO — IMPRESSÃO / WHATSAPP / PDF
// ══════════════════════════════════════════════════════

function gerarHTMLOrcamento(id) {
  const o  = state.obras.find(x=>x.id===id);
  const cl = getC(o.clienteId);
  const c  = calcObra(o);
  const data = fmtData(o.dataInicio);
  const validade = (() => {
    const d = new Date(o.dataInicio||Date.now());
    d.setDate(d.getDate()+30);
    return fmtData(d.toISOString().slice(0,10));
  })();

  const linhasItens = o.itens.map((it,i) => {
    const s = getS(it.servicoId);
    return `
      <tr>
        <td class="td-num">${i+1}</td>
        <td>${s.nome}</td>
        <td class="td-center">${s.unidade}</td>
        <td class="td-center">${it.quantidade}</td>
        <td class="td-right">${fmt(s.venda)}</td>
        <td class="td-right td-bold">${fmt(s.venda*it.quantidade)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Orçamento — ${o.nome}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Barlow',sans-serif;background:#fff;color:#1a1f2e;font-size:13px;padding:0;}
  .page{max-width:800px;margin:0 auto;padding:40px 48px;min-height:100vh;}

  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #1a2c5b;margin-bottom:32px;}
  .brand{display:flex;align-items:center;gap:14px;}
  .brand-logo{width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid #e0e4ed;}
  .brand-logo img{width:100%;height:100%;object-fit:cover;}
  .brand-name{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;color:#1a2c5b;line-height:1;text-transform:uppercase;letter-spacing:2px;}
  .brand-sub{font-size:11px;color:#8892aa;text-transform:uppercase;letter-spacing:1px;margin-top:3px;}
  .brand-contact{font-size:11.5px;color:#4a5270;margin-top:6px;line-height:1.7;}
  .doc-info{text-align:right;}
  .doc-label{font-size:10px;color:#8892aa;text-transform:uppercase;letter-spacing:0.8px;}
  .doc-num{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;color:#b8922a;line-height:1;letter-spacing:1px;}
  .doc-date{font-size:12px;color:#4a5270;margin-top:4px;}

  /* Título */
  .orcamento-title{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#1a2c5b;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;}
  .orcamento-tag{display:inline-block;background:#fdf6e8;color:#b8922a;border:1px solid #e8d5a0;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:20px;}

  /* Cliente */
  .section-label{font-size:10px;font-weight:600;color:#8892aa;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;}
  .client-box{background:#f7f8fa;border:1px solid #e0e4ed;border-radius:8px;padding:14px 18px;margin-bottom:28px;}
  .client-name{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#1a2c5b;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;}
  .client-info{font-size:12px;color:#4a5270;line-height:1.7;}

  /* Tabela */
  table{width:100%;border-collapse:collapse;margin-bottom:24px;}
  thead th{background:#1a2c5b;color:#fff;padding:10px 12px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;font-family:'Barlow',sans-serif;}
  thead th:first-child{border-radius:6px 0 0 0;}
  thead th:last-child{border-radius:0 6px 0 0;}
  tbody tr{border-bottom:1px solid #e0e4ed;}
  tbody tr:nth-child(even){background:#f7f8fa;}
  tbody tr:hover{background:#eef1f8;}
  td{padding:10px 12px;color:#1a1f2e;}
  .td-num{color:#8892aa;width:32px;text-align:center;}
  .td-center{text-align:center;}
  .td-right{text-align:right;}
  .td-bold{font-weight:600;color:#1a2c5b;font-family:'Rajdhani',sans-serif;font-size:15px;}

  /* Totais */
  .totals{display:flex;justify-content:flex-end;margin-bottom:28px;}
  .totals-box{width:260px;}
  .total-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e0e4ed;font-size:13px;color:#4a5270;}
  .total-row:last-child{border-bottom:none;padding-top:10px;margin-top:4px;}
  .total-row.main{font-size:17px;font-weight:700;color:#1a2c5b;border-top:2px solid #1a2c5b;}
  .total-row.main span:last-child{color:#b8922a;font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;letter-spacing:0.5px;}

  /* Observações / Validade */
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;}
  .info-box{background:#f7f8fa;border:1px solid #e0e4ed;border-radius:8px;padding:14px 18px;}
  .info-box-title{font-size:10px;font-weight:600;color:#8892aa;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:6px;}
  .info-box-content{font-size:12.5px;color:#1a1f2e;line-height:1.6;}

  /* Footer */
  .footer{border-top:2px solid #1a2c5b;padding-top:20px;display:flex;justify-content:space-between;align-items:center;}
  .footer-brand{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#1a2c5b;text-transform:uppercase;letter-spacing:1px;}
  .footer-note{font-size:11px;color:#8892aa;text-align:right;line-height:1.6;}

  /* Assinatura */
  .assinatura{margin-top:56px;display:flex;justify-content:space-between;}
  .ass-line{text-align:center;width:200px;}
  .ass-traço{border-top:1px solid #1a2c5b;padding-top:6px;font-size:11px;color:#4a5270;}

  @media print{
    body{padding:0;}
    .page{padding:20px 28px;}
    .no-print{display:none!important;}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Barra de ações (some ao imprimir) -->
  <div class="no-print" style="display:flex;gap:10px;margin-bottom:20px;padding:12px 16px;background:#f7f8fa;border-radius:8px;border:1px solid #e0e4ed;flex-wrap:wrap;">
    <button onclick="window.print()" style="display:flex;align-items:center;gap:7px;padding:9px 18px;background:#1a2c5b;color:#fff;border:none;border-radius:8px;font-family:Outfit,sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;">
      🖨️ Imprimir / Salvar PDF
    </button>
    <button onclick="compartilharNativo()" id="btnShare" style="display:flex;align-items:center;gap:7px;padding:9px 18px;background:#b8922a;color:#fff;border:none;border-radius:8px;font-family:Outfit,sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;">
      📤 Compartilhar
    </button>
    <a id="btnWhats" href="#" target="_blank" style="display:flex;align-items:center;gap:7px;padding:9px 18px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-family:Outfit,sans-serif;font-size:13.5px;font-weight:500;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.854l6.158-1.616A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.372l-.36-.213-3.714.974.99-3.626-.235-.373A9.818 9.818 0 1 1 12 21.818z"/></svg>
      Enviar no WhatsApp
    </a>
    <button onclick="window.close()" style="padding:9px 14px;background:none;border:1px solid #e0e4ed;border-radius:8px;font-family:Outfit,sans-serif;font-size:13px;cursor:pointer;color:#4a5270;">
      ✕ Fechar
    </button>
  </div>

  <!-- Cabeçalho -->
  <div class="header">
    <div class="brand">
      <div class="brand-logo">
        <img src="logo.png" alt="RM Gesso" onerror="this.parentNode.innerHTML='<div style=\\'width:100%;height:100%;background:#1a2c5b;display:flex;align-items:center;justify-content:center;color:#b8922a;font-family:serif;font-size:18px;font-weight:700;\\'>RM</div>'"/>
      </div>
      <div>
        <div class="brand-name">RM Gesso</div>
        <div class="brand-sub">Drywall · Forro PVC · Gesso</div>
        <div class="brand-contact">
          📱 (19) 99999-0000<br>
          📧 contato@rmgesso.com.br
        </div>
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-label">Orçamento Nº</div>
      <div class="doc-num">${String(state.obras.filter(x=>x.status==='orcamento').findIndex(x=>x.id===id)+1).padStart(3,'0')}</div>
      <div class="doc-date">Emitido em: ${data}</div>
    </div>
  </div>

  <!-- Título do orçamento -->
  <div class="orcamento-title">${o.nome}</div>
  <div class="orcamento-tag">📋 Proposta Comercial</div>

  <!-- Dados do cliente -->
  <div class="section-label">Dados do Cliente</div>
  <div class="client-box">
    <div class="client-name">${cl.nome}</div>
    <div class="client-info">
      ${cl.telefone ? '📱 '+cl.telefone+'<br>' : ''}
      ${cl.endereco ? '📍 '+cl.endereco : ''}
    </div>
  </div>

  <!-- Tabela de itens -->
  <div class="section-label">Serviços & Materiais</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Descrição</th>
        <th style="text-align:center;">Unid.</th>
        <th style="text-align:center;">Qtd.</th>
        <th style="text-align:right;">Valor Unit.</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${linhasItens || '<tr><td colspan="6" style="text-align:center;color:#8892aa;padding:20px;">Nenhum item</td></tr>'}
    </tbody>
  </table>

  <!-- Totais -->
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal</span><span>${fmt(c.venda)}</span></div>
      <div class="total-row"><span>Desconto</span><span>R$ 0,00</span></div>
      <div class="total-row main"><span>TOTAL</span><span>${fmt(c.venda)}</span></div>
    </div>
  </div>

  <!-- Validade e observações -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-title">⏳ Validade do Orçamento</div>
      <div class="info-box-content">Este orçamento é válido até<br><strong>${validade}</strong> (30 dias)</div>
    </div>
    <div class="info-box">
      <div class="info-box-title">💳 Formas de Pagamento</div>
      <div class="info-box-content">Pix · Transferência · Dinheiro<br>Condições a combinar.</div>
    </div>
  </div>

  <div class="info-box" style="margin-bottom:28px;">
    <div class="info-box-title">📝 Observações</div>
    <div class="info-box-content">Os valores acima referem-se exclusivamente aos serviços e materiais descritos. Serviços adicionais não previstos neste orçamento serão cobrados separadamente mediante aprovação prévia.</div>
  </div>

  <!-- Assinatura -->
  <div class="assinatura">
    <div class="ass-line">
      <div class="ass-traço">Assinatura do Cliente</div>
    </div>
    <div class="ass-line">
      <div class="ass-traço">RM Gesso — Responsável Técnico</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer" style="margin-top:40px;">
    <div class="footer-brand">RM Gesso</div>
    <div class="footer-note">
      Documento gerado em ${new Date().toLocaleDateString('pt-BR')}<br>
      Obrigado pela confiança!
    </div>
  </div>
</div>

<script>
// WhatsApp — monta mensagem de texto
const msgWpp = \`*RM Gesso — Orçamento*

Olá, *${cl.nome}*! Segue o resumo do seu orçamento:

📋 *${o.nome}*
📅 Data: ${data}

*Itens:*
${o.itens.map(it => {
  const s = getS ? getS(it.servicoId) : { nome: it.servicoId, venda: 0, unidade: '' };
  return `• ${s.nome} — ${it.quantidade} ${s.unidade}`;
}).join('\n')}

💰 *Total: ${fmt(c.venda)}*

Orçamento válido por 30 dias.
Qualquer dúvida, estamos à disposição! 😊\`;

document.getElementById('btnWhats').href = 'https://wa.me/?text=' + encodeURIComponent(msgWpp);
${cl.telefone ? `
const tel = '${cl.telefone}'.replace(/\\D/g,'');
if(tel.length >= 10) {
  document.getElementById('btnWhats').href = 'https://wa.me/55' + tel + '?text=' + encodeURIComponent(msgWpp);
}` : ''}

// Compartilhar nativo (mobile / desktop)
function compartilharNativo() {
  if (navigator.share) {
    navigator.share({
      title: 'Orçamento RM Gesso — ${o.nome}',
      text: msgWpp,
    }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(msgWpp).then(()=>{
      alert('Texto do orçamento copiado! Cole onde quiser.');
    });
  }
}
<\/script>
</body>
</html>`;
}

function imprimirOrcamento(id) {
  const html = gerarHTMLOrcamento(id);
  const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
  win.document.write(html);
  win.document.close();
}

function compartilharWhats(id) {
  const o  = state.obras.find(x=>x.id===id);
  const cl = getC(o.clienteId);
  const c  = calcObra(o);
  const linhas = o.itens.map(it => {
    const s = getS(it.servicoId);
    return `• ${s.nome} — ${it.quantidade} ${s.unidade} = ${fmt(s.venda*it.quantidade)}`;
  }).join('\n');
  const msg = `*RM Gesso — Orçamento*\n\nOlá, *${cl.nome}*!\n\n📋 *${o.nome}*\n📅 Data: ${fmtData(o.dataInicio)}\n\n*Itens:*\n${linhas}\n\n💰 *Total: ${fmt(c.venda)}*\n\nOrçamento válido por 30 dias.\nQualquer dúvida, estamos à disposição! 😊`;
  const tel = cl.telefone ? cl.telefone.replace(/\D/g,'') : '';
  const url = tel.length >= 10
    ? `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── INIT ───────────────────────────────────────────
navigate('dashboard');
