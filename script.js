/* =====================================================
   GessoPro — Sistema de Gestão
   script.js — Lógica principal
   ===================================================== */

// ── DADOS INICIAIS ─────────────────────────────────
const DADOS_EXEMPLO = {
  clientes: [
    { id: 'c1', nome: 'João Silva', telefone: '(19) 99123-4567', endereco: 'Rua das Acácias, 123 – Piracicaba/SP', obs: 'Cliente antigo, paga em dia.', criadoEm: '2024-01-10' },
    { id: 'c2', nome: 'Maria Fernanda', telefone: '(19) 98765-4321', endereco: 'Av. Brasil, 456 – Piracicaba/SP', obs: 'Prefere comunicação por WhatsApp.', criadoEm: '2024-03-05' },
    { id: 'c3', nome: 'Carlos Construções', telefone: '(19) 3322-1100', endereco: 'Rua Boa Vista, 789 – Americana/SP', obs: 'Empresa parceira.', criadoEm: '2024-05-20' },
  ],
  produtos: [
    { id: 'p1', nome: 'Drywall 12,5mm (m²)', tipo: 'material', unidade: 'm²',  custo: 28.00,  venda: 45.00 },
    { id: 'p2', nome: 'Forro PVC (m²)',       tipo: 'material', unidade: 'm²',  custo: 22.00,  venda: 38.00 },
    { id: 'p3', nome: 'Gesso Liso (m²)',      tipo: 'material', unidade: 'm²',  custo: 18.00,  venda: 32.00 },
    { id: 'p4', nome: 'Aplicação Drywall',    tipo: 'servico',  unidade: 'm²',  custo: 15.00,  venda: 35.00 },
    { id: 'p5', nome: 'Mão de obra Forro',    tipo: 'servico',  unidade: 'm²',  custo: 12.00,  venda: 28.00 },
    { id: 'p6', nome: 'Perfil de Aço (m)',    tipo: 'material', unidade: 'un',  custo: 8.50,   venda: 14.00 },
  ],
  obras: [
    {
      id: 'o1',
      nome: 'Reforma Residencial – Acácias',
      clienteId: 'c1',
      dataInicio: '2025-01-15',
      dataFim: '2025-02-28',
      status: 'finalizada',
      itens: [
        { id: 'i1', produtoId: 'p1', quantidade: 40 },
        { id: 'i2', produtoId: 'p4', quantidade: 40 },
        { id: 'i3', produtoId: 'p3', quantidade: 20 },
      ],
      pagamentos: [
        { id: 'pg1', data: '2025-01-20', valor: 2000, forma: 'pix', obs: 'Entrada' },
        { id: 'pg2', data: '2025-03-01', valor: 2400, forma: 'transferencia', obs: 'Pagamento final' },
      ],
    },
    {
      id: 'o2',
      nome: 'Forro PVC – Cozinha/Sala',
      clienteId: 'c2',
      dataInicio: '2025-04-01',
      dataFim: '',
      status: 'andamento',
      itens: [
        { id: 'i4', produtoId: 'p2', quantidade: 30 },
        { id: 'i5', produtoId: 'p5', quantidade: 30 },
      ],
      pagamentos: [
        { id: 'pg3', data: '2025-04-05', valor: 800, forma: 'dinheiro', obs: 'Sinal' },
      ],
    },
    {
      id: 'o3',
      nome: 'Orçamento – Galpão Industrial',
      clienteId: 'c3',
      dataInicio: '2025-05-01',
      dataFim: '',
      status: 'orcamento',
      itens: [
        { id: 'i6', produtoId: 'p1', quantidade: 120 },
        { id: 'i7', produtoId: 'p4', quantidade: 120 },
        { id: 'i8', produtoId: 'p6', quantidade: 200 },
      ],
      pagamentos: [],
    },
  ],
  despesas: [
    { id: 'd1', nome: 'Combustível – Caminhonete', valor: 350, data: '2025-04-15', categoria: 'transporte' },
    { id: 'd2', nome: 'Salário Ajudante – Março',  valor: 1800, data: '2025-03-31', categoria: 'funcionario' },
    { id: 'd3', nome: 'Compra de parafusos/fixadores', valor: 120, data: '2025-04-10', categoria: 'material' },
    { id: 'd4', nome: 'Aluguel Galpão',             valor: 600, data: '2025-04-01', categoria: 'outros' },
  ],
};

// ── STORAGE ────────────────────────────────────────
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('gessopro_' + key)) || null; } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem('gessopro_' + key, JSON.stringify(val));
  },
  load() {
    return {
      clientes: this.get('clientes') || [],
      produtos:  this.get('produtos')  || [],
      obras:     this.get('obras')     || [],
      despesas:  this.get('despesas')  || [],
    };
  },
  save(data) {
    this.set('clientes', data.clientes);
    this.set('produtos',  data.produtos);
    this.set('obras',     data.obras);
    this.set('despesas',  data.despesas);
  },
};

// ── ESTADO GLOBAL ──────────────────────────────────
let state = DB.load();

// Carrega dados de exemplo se banco estiver vazio
if (!state.clientes.length && !state.produtos.length) {
  state = { ...DADOS_EXEMPLO };
  DB.save(state);
}

// ── UTILITÁRIOS ────────────────────────────────────
function uid() {
  return '_' + Math.random().toString(36).slice(2, 9);
}

function fmt(valor) {
  return 'R$ ' + (valor || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtData(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${tipo} show`;
  setTimeout(() => el.className = 'toast', 2800);
}

function getCliente(id) {
  return state.clientes.find(c => c.id === id) || { nome: 'Desconhecido' };
}

function getProduto(id) {
  return state.produtos.find(p => p.id === id) || { nome: 'Desconhecido', custo: 0, venda: 0 };
}

function calcObra(obra) {
  let custo = 0, venda = 0;
  obra.itens.forEach(item => {
    const prod = getProduto(item.produtoId);
    custo += prod.custo * item.quantidade;
    venda += prod.venda * item.quantidade;
  });
  const recebido = (obra.pagamentos || []).reduce((a, p) => a + p.valor, 0);
  return { custo, venda, lucro: venda - custo, recebido, restante: venda - recebido };
}

// ── MODAL ──────────────────────────────────────────
function openModal(titulo, html, onSave) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBackdrop').classList.add('show');
  if (onSave) {
    document.getElementById('modalBody').dataset.onSave = 'true';
    document.getElementById('modalBody')._onSave = onSave;
  }
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('show');
}

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalBackdrop').onclick = (e) => {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
};

// ── SIDEBAR ────────────────────────────────────────
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('overlay');
const hamburger = document.getElementById('hamburger');
const sidebarClose = document.getElementById('sidebarClose');

hamburger.onclick = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
sidebarClose.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };

// ── NAVEGAÇÃO ──────────────────────────────────────
const pages = {
  dashboard: renderDashboard,
  clientes: renderClientes,
  produtos: renderProdutos,
  obras: renderObras,
  financeiro: renderFinanceiro,
  despesas: renderDespesas,
};

const pageTitles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  produtos: 'Produtos & Materiais',
  obras: 'Obras',
  financeiro: 'Financeiro',
  despesas: 'Despesas',
};

let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('topbarTitle').textContent = pageTitles[page];
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  const render = pages[page];
  if (render) render();
}

document.querySelectorAll('.nav-item').forEach(el => {
  el.onclick = (e) => { e.preventDefault(); navigate(el.dataset.page); };
});

// ── EXPORTAR DADOS ─────────────────────────────────
document.getElementById('btnExport').onclick = () => {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `gessopro_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Dados exportados com sucesso!');
};

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function renderDashboard() {
  const obrasAndamento = state.obras.filter(o => o.status === 'andamento');
  const obrasFinaliz   = state.obras.filter(o => o.status === 'finalizada');

  let totalLucro = 0, totalReceber = 0, totalCusto = 0, totalVenda = 0;
  state.obras.forEach(o => {
    const c = calcObra(o);
    totalLucro  += c.lucro;
    totalReceber += c.restante;
    totalCusto  += c.custo;
    totalVenda  += c.venda;
  });

  const totalDespesas = state.despesas.reduce((a, d) => a + d.valor, 0);

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Visão Geral</h1>
        <p>Resumo financeiro e operacional da empresa</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-label">Obras em Andamento</div>
        <div class="stat-value">${obrasAndamento.length}</div>
        <div class="stat-sub">${obrasFinaliz.length} finalizadas</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Lucro Total</div>
        <div class="stat-value green">${fmt(totalLucro)}</div>
        <div class="stat-sub">Todas as obras</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">A Receber</div>
        <div class="stat-value">${fmt(totalReceber)}</div>
        <div class="stat-sub">Saldo pendente</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Despesas</div>
        <div class="stat-value red">${fmt(totalDespesas)}</div>
        <div class="stat-sub">${state.despesas.length} lançamentos</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Total Orçado</div>
        <div class="stat-value">${fmt(totalVenda)}</div>
        <div class="stat-sub">Valor de todas as obras</div>
      </div>
    </div>

    <div class="dashboard-bottom">
      <div class="card">
        <div class="card-title">📋 Obras Recentes</div>
        ${state.obras.length === 0
          ? '<div class="empty-state"><p>Nenhuma obra cadastrada</p></div>'
          : state.obras.slice(-5).reverse().map(o => {
              const c = calcObra(o);
              const badge = statusBadge(o.status);
              return `<div class="obras-list-item">
                <span class="name">${o.nome}</span>
                ${badge}
                <span class="val">${fmt(c.venda)}</span>
              </div>`;
            }).join('')
        }
      </div>

      <div class="card">
        <div class="card-title">💰 Últimas Despesas</div>
        ${state.despesas.length === 0
          ? '<div class="empty-state"><p>Nenhuma despesa cadastrada</p></div>'
          : state.despesas.slice(-5).reverse().map(d => `
              <div class="obras-list-item">
                <span class="name">${d.nome}</span>
                <span class="badge badge-gray">${d.categoria}</span>
                <span class="val text-red">${fmt(d.valor)}</span>
              </div>`).join('')
        }
      </div>
    </div>
  `;

  // Ações rápidas
  document.getElementById('topbarActions').innerHTML = '';
}

function statusBadge(status) {
  const map = {
    andamento: '<span class="badge badge-orange">Em andamento</span>',
    finalizada: '<span class="badge badge-green">Finalizada</span>',
    orcamento:  '<span class="badge badge-blue">Orçamento</span>',
  };
  return map[status] || '';
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════
function renderClientes(filtro = '') {
  const lista = state.clientes.filter(c =>
    c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefone.includes(filtro)
  );

  document.getElementById('topbarActions').innerHTML = `
    <div class="search-bar">
      <input type="text" id="searchCliente" placeholder="Buscar cliente..." value="${filtro}" />
    </div>
    <button class="btn btn-primary" id="btnAddCliente">+ Adicionar</button>
  `;

  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Clientes</h1><p>${lista.length} cliente(s) cadastrado(s)</p></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Obras</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.length === 0
            ? `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👤</div><p>Nenhum cliente encontrado</p></div></td></tr>`
            : lista.map(c => {
                const obrasCliente = state.obras.filter(o => o.clienteId === c.id).length;
                return `<tr>
                  <td><strong>${c.nome}</strong></td>
                  <td>${c.telefone}</td>
                  <td>${c.endereco}</td>
                  <td><span class="badge badge-orange">${obrasCliente} obra(s)</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn-icon" onclick="verCliente('${c.id}')">👁</button>
                      <button class="btn-icon" onclick="editarCliente('${c.id}')">✏️</button>
                      <button class="btn-icon" onclick="excluirCliente('${c.id}')">🗑</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btnAddCliente').onclick = () => formCliente();
  document.getElementById('searchCliente').oninput = (e) => renderClientes(e.target.value);
}

function formCliente(id = null) {
  const c = id ? state.clientes.find(x => x.id === id) : {};
  openModal(id ? 'Editar Cliente' : 'Novo Cliente', `
    <div class="form-group"><label>Nome *</label><input id="fNome" value="${c.nome||''}" placeholder="Nome completo" /></div>
    <div class="form-row">
      <div class="form-group"><label>Telefone</label><input id="fTel" value="${c.telefone||''}" placeholder="(19) 99999-9999" /></div>
      <div class="form-group"><label>Data cadastro</label><input id="fData" type="date" value="${c.criadoEm||new Date().toISOString().slice(0,10)}" /></div>
    </div>
    <div class="form-group"><label>Endereço</label><input id="fEnd" value="${c.endereco||''}" placeholder="Rua, número, bairro, cidade" /></div>
    <div class="form-group"><label>Observações</label><textarea id="fObs">${c.obs||''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarCliente('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarCliente(id) {
  const nome = document.getElementById('fNome').value.trim();
  if (!nome) { toast('Nome é obrigatório!', 'error'); return; }
  if (id) {
    const idx = state.clientes.findIndex(c => c.id === id);
    state.clientes[idx] = { ...state.clientes[idx], nome, telefone: document.getElementById('fTel').value, endereco: document.getElementById('fEnd').value, obs: document.getElementById('fObs').value, criadoEm: document.getElementById('fData').value };
    toast('Cliente atualizado!');
  } else {
    state.clientes.push({ id: uid(), nome, telefone: document.getElementById('fTel').value, endereco: document.getElementById('fEnd').value, obs: document.getElementById('fObs').value, criadoEm: document.getElementById('fData').value });
    toast('Cliente adicionado!');
  }
  DB.save(state);
  closeModal();
  renderClientes();
}

function editarCliente(id) { formCliente(id); }

function excluirCliente(id) {
  if (!confirm('Excluir este cliente?')) return;
  state.clientes = state.clientes.filter(c => c.id !== id);
  DB.save(state);
  toast('Cliente removido.', 'info');
  renderClientes();
}

function verCliente(id) {
  const c  = state.clientes.find(x => x.id === id);
  const obras = state.obras.filter(o => o.clienteId === id);
  openModal(`Cliente: ${c.nome}`, `
    <p style="color:var(--text2);font-size:14px;">📞 ${c.telefone || '—'}</p>
    <p style="color:var(--text2);font-size:14px;margin-top:6px;">📍 ${c.endereco || '—'}</p>
    ${c.obs ? `<p style="margin-top:8px;color:var(--text3);font-size:13px;">💬 ${c.obs}</p>` : ''}
    <div class="section-title" style="margin-top:16px;">Obras vinculadas</div>
    ${obras.length === 0
      ? '<p class="text-muted">Nenhuma obra.</p>'
      : obras.map(o => {
          const c2 = calcObra(o);
          return `<div class="obras-list-item">${o.nome} ${statusBadge(o.status)} <span class="val">${fmt(c2.venda)}</span></div>`;
        }).join('')
    }
    <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Fechar</button></div>
  `);
}

// ══════════════════════════════════════════════════════
// PRODUTOS
// ══════════════════════════════════════════════════════
function renderProdutos(filtro = '') {
  const lista = state.produtos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  document.getElementById('topbarActions').innerHTML = `
    <div class="search-bar">
      <input type="text" id="searchProd" placeholder="Buscar produto..." value="${filtro}" />
    </div>
    <button class="btn btn-primary" id="btnAddProd">+ Adicionar</button>
  `;

  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Produtos & Materiais</h1><p>${lista.length} item(ns) cadastrado(s)</p></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Unidade</th>
            <th>Custo</th>
            <th>Venda</th>
            <th>Margem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.length === 0
            ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>Nenhum produto encontrado</p></div></td></tr>`
            : lista.map(p => {
                const margem = p.custo > 0 ? (((p.venda - p.custo) / p.custo) * 100).toFixed(0) : 0;
                return `<tr>
                  <td><strong>${p.nome}</strong></td>
                  <td><span class="badge ${p.tipo==='servico' ? 'badge-blue' : 'badge-orange'}">${p.tipo==='servico' ? 'Serviço' : 'Material'}</span></td>
                  <td>${p.unidade}</td>
                  <td>${fmt(p.custo)}</td>
                  <td class="text-green fw-bold">${fmt(p.venda)}</td>
                  <td><span class="badge badge-green">+${margem}%</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn-icon" onclick="editarProduto('${p.id}')">✏️</button>
                      <button class="btn-icon" onclick="excluirProduto('${p.id}')">🗑</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btnAddProd').onclick = () => formProduto();
  document.getElementById('searchProd').oninput = (e) => renderProdutos(e.target.value);
}

function formProduto(id = null) {
  const p = id ? state.produtos.find(x => x.id === id) : {};
  openModal(id ? 'Editar Produto' : 'Novo Produto', `
    <div class="form-group"><label>Nome *</label><input id="pNome" value="${p.nome||''}" placeholder="Ex: Drywall 12,5mm" /></div>
    <div class="form-row">
      <div class="form-group"><label>Tipo</label>
        <select id="pTipo">
          <option value="material" ${p.tipo==='material'?'selected':''}>Material</option>
          <option value="servico"  ${p.tipo==='servico'?'selected':''}>Serviço</option>
        </select>
      </div>
      <div class="form-group"><label>Unidade</label>
        <select id="pUnid">
          <option value="m²"  ${p.unidade==='m²'?'selected':''}>m²</option>
          <option value="m"   ${p.unidade==='m'?'selected':''}>metro (m)</option>
          <option value="un"  ${p.unidade==='un'?'selected':''}>Unidade</option>
          <option value="kg"  ${p.unidade==='kg'?'selected':''}>kg</option>
          <option value="saco"${p.unidade==='saco'?'selected':''}>Saco</option>
          <option value="h"   ${p.unidade==='h'?'selected':''}>Hora</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Custo por unidade (R$)</label><input id="pCusto" type="number" step="0.01" value="${p.custo||''}" placeholder="0,00" /></div>
      <div class="form-group"><label>Valor de venda (R$)</label><input id="pVenda" type="number" step="0.01" value="${p.venda||''}" placeholder="0,00" /></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarProduto('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarProduto(id) {
  const nome = document.getElementById('pNome').value.trim();
  if (!nome) { toast('Nome é obrigatório!', 'error'); return; }
  const obj = {
    nome,
    tipo: document.getElementById('pTipo').value,
    unidade: document.getElementById('pUnid').value,
    custo: parseFloat(document.getElementById('pCusto').value) || 0,
    venda: parseFloat(document.getElementById('pVenda').value) || 0,
  };
  if (id) {
    const idx = state.produtos.findIndex(p => p.id === id);
    state.produtos[idx] = { ...state.produtos[idx], ...obj };
    toast('Produto atualizado!');
  } else {
    state.produtos.push({ id: uid(), ...obj });
    toast('Produto adicionado!');
  }
  DB.save(state);
  closeModal();
  renderProdutos();
}

function editarProduto(id) { formProduto(id); }

function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  state.produtos = state.produtos.filter(p => p.id !== id);
  DB.save(state);
  toast('Produto removido.', 'info');
  renderProdutos();
}

// ══════════════════════════════════════════════════════
// OBRAS
// ══════════════════════════════════════════════════════
function renderObras(filtroStatus = 'todos') {
  let lista = state.obras;
  if (filtroStatus !== 'todos') lista = lista.filter(o => o.status === filtroStatus);

  document.getElementById('topbarActions').innerHTML = `
    <select id="filtroObra" class="btn btn-secondary" style="cursor:pointer;">
      <option value="todos"     ${filtroStatus==='todos'?'selected':''}>Todas</option>
      <option value="andamento" ${filtroStatus==='andamento'?'selected':''}>Em andamento</option>
      <option value="finalizada"${filtroStatus==='finalizada'?'selected':''}>Finalizadas</option>
      <option value="orcamento" ${filtroStatus==='orcamento'?'selected':''}>Orçamentos</option>
    </select>
    <button class="btn btn-primary" id="btnAddObra">+ Nova Obra</button>
  `;

  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Obras</h1><p>${lista.length} obra(s)</p></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Obra</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Início</th>
            <th>Orçamento</th>
            <th>Recebido</th>
            <th>Lucro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.length === 0
            ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏗️</div><p>Nenhuma obra neste filtro</p></div></td></tr>`
            : lista.map(o => {
                const cl = getCliente(o.clienteId);
                const c  = calcObra(o);
                return `<tr>
                  <td><strong>${o.nome}</strong></td>
                  <td>${cl.nome}</td>
                  <td>${statusBadge(o.status)}</td>
                  <td>${fmtData(o.dataInicio)}</td>
                  <td class="fw-bold">${fmt(c.venda)}</td>
                  <td class="text-green">${fmt(c.recebido)}</td>
                  <td class="${c.lucro >= 0 ? 'text-green' : 'text-red'} fw-bold">${fmt(c.lucro)}</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn-icon" onclick="verObra('${o.id}')">👁</button>
                      <button class="btn-icon" onclick="editarObra('${o.id}')">✏️</button>
                      <button class="btn-icon" onclick="excluirObra('${o.id}')">🗑</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btnAddObra').onclick = () => formObra();
  document.getElementById('filtroObra').onchange = (e) => renderObras(e.target.value);
}

function formObra(id = null) {
  const o = id ? state.obras.find(x => x.id === id) : {};
  const clienteOptions = state.clientes.map(c =>
    `<option value="${c.id}" ${o.clienteId===c.id?'selected':''}>${c.nome}</option>`
  ).join('');

  openModal(id ? 'Editar Obra' : 'Nova Obra', `
    <div class="form-group"><label>Nome / Identificação *</label><input id="oNome" value="${o.nome||''}" placeholder="Ex: Reforma Residencial – Rua X" /></div>
    <div class="form-group"><label>Cliente</label>
      <select id="oCliente">
        <option value="">— Selecione —</option>
        ${clienteOptions}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data de Início</label><input id="oInicio" type="date" value="${o.dataInicio||''}" /></div>
      <div class="form-group"><label>Data de Término</label><input id="oFim" type="date" value="${o.dataFim||''}" /></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="oStatus">
        <option value="orcamento"  ${o.status==='orcamento'?'selected':''}>Orçamento</option>
        <option value="andamento"  ${o.status==='andamento'?'selected':''}>Em andamento</option>
        <option value="finalizada" ${o.status==='finalizada'?'selected':''}>Finalizada</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarObra('${id||''}')">Salvar</button>
    </div>
  `);
}

function salvarObra(id) {
  const nome = document.getElementById('oNome').value.trim();
  if (!nome) { toast('Nome da obra é obrigatório!', 'error'); return; }
  if (id) {
    const idx = state.obras.findIndex(o => o.id === id);
    state.obras[idx] = {
      ...state.obras[idx],
      nome,
      clienteId: document.getElementById('oCliente').value,
      dataInicio: document.getElementById('oInicio').value,
      dataFim: document.getElementById('oFim').value,
      status: document.getElementById('oStatus').value,
    };
    toast('Obra atualizada!');
  } else {
    state.obras.push({
      id: uid(),
      nome,
      clienteId: document.getElementById('oCliente').value,
      dataInicio: document.getElementById('oInicio').value,
      dataFim: document.getElementById('oFim').value,
      status: document.getElementById('oStatus').value,
      itens: [],
      pagamentos: [],
    });
    toast('Obra criada!');
  }
  DB.save(state);
  closeModal();
  renderObras();
}

function editarObra(id) { formObra(id); }

function excluirObra(id) {
  if (!confirm('Excluir esta obra?')) return;
  state.obras = state.obras.filter(o => o.id !== id);
  DB.save(state);
  toast('Obra removida.', 'info');
  renderObras();
}

function verObra(id) {
  const o  = state.obras.find(x => x.id === id);
  const cl = getCliente(o.clienteId);
  const c  = calcObra(o);
  const progresso = c.venda > 0 ? Math.min((c.recebido / c.venda) * 100, 100).toFixed(0) : 0;

  const prodOptions = state.produtos.map(p =>
    `<option value="${p.id}">${p.nome} (${p.unidade})</option>`
  ).join('');

  openModal(`Obra: ${o.nome}`, `
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;">
      <div><span class="text-muted">Cliente</span><br><strong>${cl.nome}</strong></div>
      <div><span class="text-muted">Status</span><br>${statusBadge(o.status)}</div>
      <div><span class="text-muted">Início</span><br><strong>${fmtData(o.dataInicio)}</strong></div>
      ${o.dataFim ? `<div><span class="text-muted">Término</span><br><strong>${fmtData(o.dataFim)}</strong></div>` : ''}
    </div>

    <!-- Resumo financeiro -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
      <div class="card" style="padding:12px;text-align:center;">
        <div class="stat-label">Custo</div>
        <div style="font-family:Syne,sans-serif;font-weight:700;color:var(--red);">${fmt(c.custo)}</div>
      </div>
      <div class="card" style="padding:12px;text-align:center;">
        <div class="stat-label">Orçamento</div>
        <div style="font-family:Syne,sans-serif;font-weight:700;color:var(--text);">${fmt(c.venda)}</div>
      </div>
      <div class="card" style="padding:12px;text-align:center;">
        <div class="stat-label">Lucro</div>
        <div style="font-family:Syne,sans-serif;font-weight:700;color:var(--green);">${fmt(c.lucro)}</div>
      </div>
    </div>

    <!-- Progresso pagamento -->
    <div style="margin-bottom:16px;">
      <div class="flex-between"><span class="text-muted">Pagamento recebido</span><span class="text-muted">${progresso}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progresso}%"></div></div>
      <div class="flex-between mt-8">
        <span class="text-muted">Recebido: <strong class="text-green">${fmt(c.recebido)}</strong></span>
        <span class="text-muted">Restante: <strong class="text-orange">${fmt(c.restante)}</strong></span>
      </div>
    </div>

    <!-- Itens da obra -->
    <div class="section-title">📦 Materiais & Serviços</div>
    <div id="listaItens">
      ${renderItensObra(o)}
    </div>

    <!-- Adicionar item -->
    <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;margin-top:10px;align-items:end;">
      <div class="form-group" style="margin:0;"><label>Produto</label>
        <select id="novoItemProd">${prodOptions}</select>
      </div>
      <div class="form-group" style="margin:0;"><label>Quantidade</label>
        <input id="novoItemQtd" type="number" min="0.01" step="0.01" value="1" />
      </div>
      <button class="btn btn-primary btn-sm" onclick="adicionarItemObra('${o.id}')">+ Add</button>
    </div>

    <!-- Pagamentos -->
    <div class="section-title" style="margin-top:20px;">💳 Pagamentos</div>
    <div id="listaPagamentos">
      ${renderPagamentosObra(o)}
    </div>

    <!-- Adicionar pagamento -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-top:10px;align-items:end;flex-wrap:wrap;">
      <div class="form-group" style="margin:0;"><label>Data</label><input id="pagData" type="date" value="${new Date().toISOString().slice(0,10)}" /></div>
      <div class="form-group" style="margin:0;"><label>Valor (R$)</label><input id="pagValor" type="number" step="0.01" placeholder="0,00" /></div>
      <div class="form-group" style="margin:0;"><label>Forma</label>
        <select id="pagForma">
          <option value="dinheiro">Dinheiro</option>
          <option value="pix">Pix</option>
          <option value="transferencia">Transferência</option>
          <option value="cartao">Cartão</option>
          <option value="boleto">Boleto</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="adicionarPagamento('${o.id}')">+ Add</button>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary" onclick="editarObra('${o.id}');closeModal();">Editar Obra</button>
    </div>
  `);
}

function renderItensObra(o) {
  if (!o.itens.length) return '<p class="text-muted">Nenhum item adicionado.</p>';
  return o.itens.map(item => {
    const p = getProduto(item.produtoId);
    return `
      <div class="item-obra-row">
        <strong>${p.nome}</strong>
        <span>${item.quantidade} ${p.unidade}</span>
        <span class="text-red">Custo: ${fmt(p.custo * item.quantidade)}</span>
        <span class="text-green">Venda: ${fmt(p.venda * item.quantidade)}</span>
        <button class="btn-icon btn-sm" onclick="removerItemObra('${o.id}','${item.id}')">✕</button>
      </div>
    `;
  }).join('');
}

function renderPagamentosObra(o) {
  if (!o.pagamentos.length) return '<p class="text-muted">Nenhum pagamento registrado.</p>';
  return o.pagamentos.map(pg => `
    <div class="pag-row">
      <span>${fmtData(pg.data)}</span>
      <span class="badge badge-blue">${pg.forma}</span>
      <span>${pg.obs||''}</span>
      <strong class="text-green">${fmt(pg.valor)}</strong>
      <button class="btn-icon btn-sm" onclick="removerPagamento('${o.id}','${pg.id}')">✕</button>
    </div>
  `).join('');
}

function adicionarItemObra(obraId) {
  const produtoId = document.getElementById('novoItemProd').value;
  const quantidade = parseFloat(document.getElementById('novoItemQtd').value) || 0;
  if (!produtoId || quantidade <= 0) { toast('Selecione o produto e a quantidade!', 'error'); return; }
  const idx = state.obras.findIndex(o => o.id === obraId);
  state.obras[idx].itens.push({ id: uid(), produtoId, quantidade });
  DB.save(state);
  const o = state.obras[idx];
  document.getElementById('listaItens').innerHTML = renderItensObra(o);
  // atualizar resumo financeiro
  toast('Item adicionado!');
  renderObras();
}

function removerItemObra(obraId, itemId) {
  const idx = state.obras.findIndex(o => o.id === obraId);
  state.obras[idx].itens = state.obras[idx].itens.filter(i => i.id !== itemId);
  DB.save(state);
  document.getElementById('listaItens').innerHTML = renderItensObra(state.obras[idx]);
  toast('Item removido.', 'info');
  renderObras();
}

function adicionarPagamento(obraId) {
  const data  = document.getElementById('pagData').value;
  const valor = parseFloat(document.getElementById('pagValor').value) || 0;
  const forma = document.getElementById('pagForma').value;
  if (!data || valor <= 0) { toast('Preencha data e valor!', 'error'); return; }
  const idx = state.obras.findIndex(o => o.id === obraId);
  state.obras[idx].pagamentos.push({ id: uid(), data, valor, forma, obs: '' });
  DB.save(state);
  document.getElementById('listaPagamentos').innerHTML = renderPagamentosObra(state.obras[idx]);
  document.getElementById('pagValor').value = '';
  toast('Pagamento registrado!');
  renderObras();
}

function removerPagamento(obraId, pagId) {
  const idx = state.obras.findIndex(o => o.id === obraId);
  state.obras[idx].pagamentos = state.obras[idx].pagamentos.filter(p => p.id !== pagId);
  DB.save(state);
  document.getElementById('listaPagamentos').innerHTML = renderPagamentosObra(state.obras[idx]);
  toast('Pagamento removido.', 'info');
  renderObras();
}

// ══════════════════════════════════════════════════════
// FINANCEIRO
// ══════════════════════════════════════════════════════
function renderFinanceiro() {
  let totalVenda = 0, totalCusto = 0, totalRecebido = 0, totalRestante = 0;
  state.obras.forEach(o => {
    const c = calcObra(o);
    totalVenda    += c.venda;
    totalCusto    += c.custo;
    totalRecebido += c.recebido;
    totalRestante += c.restante;
  });
  const totalLucro = totalVenda - totalCusto;
  const totalDespesas = state.despesas.reduce((a, d) => a + d.valor, 0);
  const resultadoLiquido = totalLucro - totalDespesas;

  document.getElementById('topbarActions').innerHTML = '';
  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Financeiro</h1><p>Análise financeira completa</p></div>
    </div>

    <div class="stats-grid">
      <div class="stat-card green">
        <div class="stat-label">Faturamento Total</div>
        <div class="stat-value">${fmt(totalVenda)}</div>
        <div class="stat-sub">Soma de todas as obras</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Custo Total</div>
        <div class="stat-value red">${fmt(totalCusto)}</div>
        <div class="stat-sub">Materiais + serviços</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-label">Lucro Bruto</div>
        <div class="stat-value orange">${fmt(totalLucro)}</div>
        <div class="stat-sub">Antes das despesas</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Recebido</div>
        <div class="stat-value">${fmt(totalRecebido)}</div>
        <div class="stat-sub">Pagamentos confirmados</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">A Receber</div>
        <div class="stat-value">${fmt(totalRestante)}</div>
        <div class="stat-sub">Saldo pendente</div>
      </div>
      <div class="stat-card ${resultadoLiquido >= 0 ? 'green' : 'red'}">
        <div class="stat-label">Resultado Líquido</div>
        <div class="stat-value ${resultadoLiquido >= 0 ? 'green' : 'red'}">${fmt(resultadoLiquido)}</div>
        <div class="stat-sub">Lucro − despesas gerais</div>
      </div>
    </div>

    <div class="section-title">Detalhamento por obra</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Obra</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Orçamento</th>
            <th>Custo</th>
            <th>Lucro</th>
            <th>Recebido</th>
            <th>Restante</th>
          </tr>
        </thead>
        <tbody>
          ${state.obras.length === 0
            ? `<tr><td colspan="8"><div class="empty-state"><p>Nenhuma obra cadastrada</p></div></td></tr>`
            : state.obras.map(o => {
                const cl = getCliente(o.clienteId);
                const c  = calcObra(o);
                return `<tr>
                  <td><strong>${o.nome}</strong></td>
                  <td>${cl.nome}</td>
                  <td>${statusBadge(o.status)}</td>
                  <td>${fmt(c.venda)}</td>
                  <td class="text-red">${fmt(c.custo)}</td>
                  <td class="${c.lucro>=0?'text-green':'text-red'} fw-bold">${fmt(c.lucro)}</td>
                  <td class="text-green">${fmt(c.recebido)}</td>
                  <td class="text-orange">${fmt(c.restante)}</td>
                </tr>`;
              }).join('')
          }
        </tbody>
        <tfoot>
          <tr style="background:var(--bg3);">
            <td colspan="3"><strong>TOTAL</strong></td>
            <td><strong>${fmt(totalVenda)}</strong></td>
            <td class="text-red"><strong>${fmt(totalCusto)}</strong></td>
            <td class="text-green fw-bold">${fmt(totalLucro)}</td>
            <td class="text-green"><strong>${fmt(totalRecebido)}</strong></td>
            <td class="text-orange"><strong>${fmt(totalRestante)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// DESPESAS
// ══════════════════════════════════════════════════════
function renderDespesas(filtro = '') {
  const lista = state.despesas.filter(d =>
    d.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    d.categoria.toLowerCase().includes(filtro.toLowerCase())
  );
  const total = lista.reduce((a, d) => a + d.valor, 0);

  document.getElementById('topbarActions').innerHTML = `
    <div class="search-bar">
      <input type="text" id="searchDesp" placeholder="Buscar despesa..." value="${filtro}" />
    </div>
    <button class="btn btn-primary" id="btnAddDesp">+ Adicionar</button>
  `;

  document.getElementById('content').innerHTML = `
    <div class="page-header">
      <div><h1>Despesas</h1><p>Total: <strong class="text-red">${fmt(total)}</strong></p></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.length === 0
            ? `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💸</div><p>Nenhuma despesa encontrada</p></div></td></tr>`
            : lista.slice().reverse().map(d => `
                <tr>
                  <td><strong>${d.nome}</strong></td>
                  <td><span class="badge ${catBadge(d.categoria)}">${d.categoria}</span></td>
                  <td>${fmtData(d.data)}</td>
                  <td class="text-red fw-bold">${fmt(d.valor)}</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn-icon" onclick="editarDespesa('${d.id}')">✏️</button>
                      <button class="btn-icon" onclick="excluirDespesa('${d.id}')">🗑</button>
                    </div>
                  </td>
                </tr>`).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btnAddDesp').onclick = () => formDespesa();
  document.getElementById('searchDesp').oninput = (e) => renderDespesas(e.target.value);
}

function catBadge(cat) {
  const map = { material:'badge-orange', transporte:'badge-blue', funcionario:'badge-purple', outros:'badge-gray' };
  return map[cat] || 'badge-gray';
}

function formDespesa(id = null) {
  const d = id ? state.despesas.find(x => x.id === id) : {};
  openModal(id ? 'Editar Despesa' : 'Nova Despesa', `
    <div class="form-group"><label>Descrição *</label><input id="dNome" value="${d.nome||''}" placeholder="Ex: Combustível, Salário..." /></div>
    <div class="form-row">
      <div class="form-group"><label>Valor (R$) *</label><input id="dValor" type="number" step="0.01" value="${d.valor||''}" placeholder="0,00" /></div>
      <div class="form-group"><label>Data *</label><input id="dData" type="date" value="${d.data||new Date().toISOString().slice(0,10)}" /></div>
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

function salvarDespesa(id) {
  const nome  = document.getElementById('dNome').value.trim();
  const valor = parseFloat(document.getElementById('dValor').value) || 0;
  const data  = document.getElementById('dData').value;
  if (!nome || valor <= 0 || !data) { toast('Preencha todos os campos!', 'error'); return; }
  const obj = { nome, valor, data, categoria: document.getElementById('dCat').value };
  if (id) {
    const idx = state.despesas.findIndex(d => d.id === id);
    state.despesas[idx] = { ...state.despesas[idx], ...obj };
    toast('Despesa atualizada!');
  } else {
    state.despesas.push({ id: uid(), ...obj });
    toast('Despesa adicionada!');
  }
  DB.save(state);
  closeModal();
  renderDespesas();
}

function editarDespesa(id) { formDespesa(id); }

function excluirDespesa(id) {
  if (!confirm('Excluir esta despesa?')) return;
  state.despesas = state.despesas.filter(d => d.id !== id);
  DB.save(state);
  toast('Despesa removida.', 'info');
  renderDespesas();
}

// ── INICIALIZAÇÃO ──────────────────────────────────
navigate('dashboard');
