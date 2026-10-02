// ===== LetterBook — interações da plataforma =====
// Os dados (livros, comunidades, leitores e estado do usuário) ficam em js/dados.js.

const state = loadState();

// ---------- Funções de apoio ----------

// Evita que um texto digitado pelo usuário seja interpretado como HTML
function escapeHtml(texto) {
  return String(texto).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function findBook(id) {
  return LIVROS.find(function (livro) { return livro.id === id; });
}

// O livro que o usuário está lendo agora (ou null)
function currentBook() {
  return state.livros.find(function (l) { return l.status === "lendo"; }) || null;
}

function finishedBooks() {
  return state.livros.filter(function (l) { return l.status === "concluido"; });
}

function pagesRead() {
  return state.livros.reduce(function (soma, l) { return soma + l.pagina; }, 0);
}

function today() {
  return new Date().toLocaleDateString("pt-BR");
}

function formatNumber(numero) {
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

// 148800 segundos -> "41h 20min"
function formatTime(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return horas > 0 ? horas + "h " + minutos + "min" : minutos + "min";
}

// 725 segundos -> "00:12:05"
function formatClock(segundos) {
  const partes = [Math.floor(segundos / 3600), Math.floor((segundos % 3600) / 60), segundos % 60];
  return partes.map(function (p) { return String(p).padStart(2, "0"); }).join(":");
}

function initials(nome) {
  const partes = nome.trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

// Mostra uma mensagem de sucesso ou de erro para o usuário
function showFeedback(elementId, mensagem, erro) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensagem;
  el.className = "msg-feedback " + (erro ? "is-error" : "is-success");
}

function coverHtml(livro) {
  return `<div class="cover" style="background-color: ${livro.cor}">${escapeHtml(livro.titulo)}</div>`;
}

// ---------- Topo da página ----------

// Menu mobile (abre/fecha os links de navegação)
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// Ícone do perfil (PBI-10) e contador do sino de notificações
function renderNav() {
  const avatar = document.getElementById("navAvatar");
  if (avatar) avatar.textContent = initials(state.nome);

  const contador = document.getElementById("navBellCount");
  if (contador) {
    contador.textContent = state.avisosNovos;
    contador.hidden = state.avisosNovos === 0;
  }
}

// Números do usuário (aparecem no início, na leitura, no progresso e no perfil)
function renderStats() {
  const valores = {
    livros: finishedBooks().length,
    paginas: formatNumber(pagesRead()),
    tempo: formatTime(state.tempoSeg),
    amizades: state.amizades.length
  };
  document.querySelectorAll("[data-stat]").forEach(function (el) {
    el.textContent = valores[el.dataset.stat];
  });
}

const homeGreeting = document.getElementById("homeGreeting");
if (homeGreeting) homeGreeting.textContent = "Olá, " + state.nome.split(" ")[0] + "!";

// ---------- Leitura atual ----------
let justFinished = null; // livro concluído nesta visita, para mostrar o progresso em 100%

const updateBtn = document.getElementById("updatePageBtn");
const pageInput = document.getElementById("pageInput");

// Mostra o livro em leitura, a página salva e a barra de progresso
function renderProgress() {
  const painel = document.getElementById("readingPanel");
  if (!painel) return;

  const leitura = currentBook() || justFinished;
  if (!leitura) {
    painel.innerHTML = "<p>Você não está lendo nenhum livro no momento. Escolha o próximo em <strong>Sugestões</strong>.</p>";
    return;
  }

  const livro = findBook(leitura.livroId);
  const concluido = leitura.status === "concluido";
  const porcento = Math.round((leitura.pagina / livro.paginas) * 100);

  painel.innerHTML = `
    ${coverHtml(livro)}
    <div class="reading-info">
      <span class="tag">${livro.genero}</span>
      <h2>${livro.titulo}</h2>
      <p>${livro.autor}</p>
      <p>Status: <strong id="bookStatus">${concluido ? "Concluído ✓" : "Lendo"}</strong></p>
      <p>Página <strong id="currentPageValue">${leitura.pagina}</strong> de ${livro.paginas} (${porcento}%)</p>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: ${porcento}%"></div>
      </div>
    </div>`;
}

// ---- PBI-01: iniciar a sessão de leitura ----
const startSessionBtn = document.getElementById("startSessionBtn");
const stopSessionBtn = document.getElementById("stopSessionBtn");

function sessionSeconds() {
  return state.sessaoInicio ? Math.floor((Date.now() - state.sessaoInicio) / 1000) : 0;
}

// Atualiza o cronômetro da sessão
function renderSession() {
  document.getElementById("sessionClock").textContent = formatClock(sessionSeconds());
  stopSessionBtn.disabled = !state.sessaoInicio;
}

// Encerra a sessão e soma o tempo dela ao tempo total de leitura
function endSession() {
  const segundos = sessionSeconds();
  state.tempoSeg += segundos;
  state.sessaoInicio = null;
  saveState();
  renderSession();
  renderStats();
  showFeedback("sessionFeedback", "Sessão encerrada: " + formatClock(segundos) + " somados ao seu tempo de leitura.", false);
}

if (startSessionBtn) {
  renderSession();
  setInterval(renderSession, 1000);

  startSessionBtn.addEventListener("click", function () {
    // FALHA: a leitura já foi iniciada (existe uma sessão em andamento)
    if (state.sessaoInicio) {
      showFeedback("sessionFeedback", "Erro: a sessão de leitura já foi iniciada. Não foi possível mensurar o tempo e os livros lidos em uma nova sessão.", true);
      return;
    }

    // FALHA: não existe livro em leitura para mensurar
    if (!currentBook()) {
      showFeedback("sessionFeedback", "Erro: não há nenhum livro em leitura. Escolha um livro antes de iniciar a sessão.", true);
      return;
    }

    // SUCESSO: a plataforma passa a mensurar o tempo e a quantidade de livros lidos
    state.sessaoInicio = Date.now();
    saveState();
    renderSession();
    showFeedback("sessionFeedback", "Sessão iniciada! A plataforma está mensurando o seu tempo de leitura e os seus livros lidos.", false);
  });

  stopSessionBtn.addEventListener("click", function () {
    if (state.sessaoInicio) endSession();
  });
}

// ---- PBI-07: informar a página atual do livro ----
if (updateBtn && pageInput) {
  updateBtn.addEventListener("click", function () {
    // FALHA: não existe livro em leitura
    const leitura = currentBook();
    if (!leitura) {
      showFeedback("progressFeedback", "Não há nenhum livro em leitura. A página não foi registrada.", true);
      return;
    }

    const totalPages = findBook(leitura.livroId).paginas;
    const texto = pageInput.value.trim();
    const novaPagina = Number(texto);

    // FALHA: campo vazio, número com vírgula/ponto, menor que 1 ou maior que o total
    if (texto === "" || !Number.isInteger(novaPagina) || novaPagina < 1 || novaPagina > totalPages) {
      showFeedback("progressFeedback", "É necessário inserir uma página válida (de 1 a " + totalPages + "). A página não foi registrada.", true);
      return; // sai sem salvar nada
    }

    // SUCESSO: salva a página e atualiza o progresso
    leitura.pagina = novaPagina;
    saveState();
    renderProgress();
    renderStats();
    showFeedback("progressFeedback", "Página " + novaPagina + " registrada! Progresso atualizado.", false);
    pageInput.value = "";
  });
}

// ---- PBI-08: registrar o livro no histórico de leitura ----
const finishBtn = document.getElementById("finishBookBtn");

if (finishBtn) {
  finishBtn.addEventListener("click", function () {
    // FALHA 1: não existe livro em leitura
    const leitura = currentBook();
    if (!leitura) {
      showFeedback("finishFeedback", "Não há nenhum livro em leitura. O status do livro foi mantido.", true);
      return;
    }

    // FALHA 2: o usuário ainda não chegou na última página
    const livro = findBook(leitura.livroId);
    if (leitura.pagina < livro.paginas) {
      showFeedback("finishFeedback", "Você ainda não chegou na última página (página " + leitura.pagina + " de " + livro.paginas + "). Registre a página " + livro.paginas + " para concluir o livro.", true);
      return;
    }

    // FALHA 3: o usuário não confirmou a ação
    const confirmou = confirm("Deseja marcar \"" + livro.titulo + "\" como concluído?");
    if (!confirmou) {
      showFeedback("finishFeedback", "Ação não confirmada. O livro continua em leitura.", true);
      return;
    }

    // SUCESSO: marca como concluído, progresso em 100% e registra no histórico
    leitura.status = "concluido";
    leitura.pagina = livro.paginas;
    leitura.fim = today();
    justFinished = leitura;
    saveState();

    if (state.sessaoInicio) endSession(); // a sessão termina junto com o livro
    renderProgress();
    renderStats();
    showFeedback("finishFeedback", "Livro concluído e registrado no histórico! Progresso: 100%.", false);
  });
}

// ---------- Histórico ----------
const historyList = document.getElementById("historyList");

if (historyList) {
  if (state.livros.length === 0) {
    historyList.innerHTML = "<p>Seu histórico está vazio. Os livros que você começar a ler aparecem aqui.</p>";
  } else {
    historyList.innerHTML = state.livros.map(function (l) {
      const livro = findBook(l.livroId);
      const concluido = l.status === "concluido";
      return `<div class="history-item">
        <div>
          <strong>${livro.titulo}</strong>
          <p>${concluido ? "Concluído em " + l.fim : "Iniciado em " + l.inicio + " · página " + l.pagina + " de " + livro.paginas}</p>
        </div>
        <span class="status ${concluido ? "concluido" : "lendo"}">${concluido ? "Concluído" : "Lendo"}</span>
      </div>`;
    }).join("");
  }
}

// ---------- Concluídos ----------
const finishedList = document.getElementById("finishedList");

if (finishedList) {
  const concluidos = finishedBooks();
  if (concluidos.length === 0) {
    finishedList.innerHTML = "<p>Você ainda não concluiu nenhum livro.</p>";
  } else {
    finishedList.innerHTML = concluidos.map(function (l) {
      const livro = findBook(l.livroId);
      return `<div class="card book-card">
        ${coverHtml(livro)}
        <div>
          <span class="tag">${livro.genero}</span>
          <h3>${livro.titulo}</h3>
          <p>${livro.autor}</p>
          <p>Concluído em ${l.fim}</p>
        </div>
      </div>`;
    }).join("");
  }
}

// ---------- Sugestões ----------
const suggestionList = document.getElementById("suggestionList");

if (suggestionList) {
  // sugere os livros do catálogo que o usuário ainda não começou
  const meusLivros = state.livros.map(function (l) { return l.livroId; });
  const sugestoes = LIVROS.filter(function (livro) { return !meusLivros.includes(livro.id); });

  suggestionList.innerHTML = sugestoes.map(function (livro) {
    return `<div class="card book-card">
      ${coverHtml(livro)}
      <div>
        <span class="tag">${livro.genero}</span>
        <h3>${livro.titulo}</h3>
        <p>${livro.autor} · ${livro.paginas} páginas</p>
        <button class="btn btn-small" data-start="${livro.id}">Começar a ler</button>
      </div>
    </div>`;
  }).join("");

  suggestionList.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-start]");
    if (!botao) return;

    // só um livro fica em leitura por vez
    const atual = currentBook();
    if (atual) {
      showFeedback("suggestionFeedback", "Você já está lendo \"" + findBook(atual.livroId).titulo + "\". Conclua esse livro antes de começar outro.", true);
      window.scrollTo(0, 0);
      return;
    }

    state.livros.unshift({ livroId: botao.dataset.start, status: "lendo", pagina: 0, inicio: today(), fim: null });
    saveState();
    location.href = "leitura.html";
  });
}

// ---- PBI-02: navegar pelas comunidades ----
const communityList = document.getElementById("communityList");
const communityDetail = document.getElementById("communityDetail");

function openCommunity(id) {
  const comunidade = COMUNIDADES.find(function (c) { return c.id === id; });
  const conteudo = document.getElementById("communityContent");

  communityList.hidden = true;
  communityDetail.hidden = false;
  document.getElementById("communityName").textContent = comunidade.nome;

  // FALHA: a comunidade selecionada foi removida ou está indisponível
  if (comunidade.status !== "ativa") {
    const motivo = comunidade.status === "removida" ? "foi removida" : "está indisponível no momento";
    conteudo.hidden = true;
    showFeedback("communityFeedback", "Erro: esta comunidade " + motivo + ". Não foi possível exibir o conteúdo da comunidade.", true);
    return;
  }

  // SUCESSO: exibe as publicações, os membros e os livros em discussão
  showFeedback("communityFeedback", "", false);
  conteudo.hidden = false;

  document.getElementById("communityPosts").innerHTML = comunidade.publicacoes.map(function (p) {
    return `<div class="post"><strong>${p.autor}</strong><p>${p.texto}</p></div>`;
  }).join("");

  document.getElementById("communityMembers").innerHTML = comunidade.participantes.map(function (nome) {
    return `<li>${nome}</li>`;
  }).join("") + `<li>e outros ${formatNumber(comunidade.membros - comunidade.participantes.length)} membros</li>`;

  document.getElementById("communityBooks").innerHTML = comunidade.livros.map(function (livroId) {
    const livro = findBook(livroId);
    return `<li><span><strong>${livro.titulo}</strong> — ${livro.autor}</span></li>`;
  }).join("");
}

if (communityList && communityDetail) {
  communityList.innerHTML = COMUNIDADES.map(function (c) {
    return `<div class="card">
      <h3>${c.nome}</h3>
      <p>${formatNumber(c.membros)} membros</p>
      <p>${c.descricao}</p>
      <button class="btn btn-small" data-community="${c.id}">Abrir comunidade</button>
    </div>`;
  }).join("");

  communityList.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-community]");
    if (botao) openCommunity(botao.dataset.community);
  });

  document.getElementById("communityBack").addEventListener("click", function () {
    communityDetail.hidden = true;
    communityList.hidden = false;
  });
}

// ---------- Ranking: abas Pódio e Progresso ----------
const tabPodio = document.getElementById("tabPodio");
const tabProgresso = document.getElementById("tabProgresso");

// Pontos = livros × 100 + páginas ÷ 10 + horas × 10
function calcPoints(leitor) {
  return leitor.livros * 100 + Math.floor(leitor.paginas / 10) + leitor.horas * 10;
}

// O próprio usuário no mesmo formato da lista de leitores
function myReader() {
  return {
    nome: state.nome + " (você)",
    livros: finishedBooks().length,
    paginas: pagesRead(),
    horas: Math.floor(state.tempoSeg / 3600)
  };
}

// ---- PBI-04: contabilizar os livros concluídos (pódio) ----
function renderPodium(filtro) {
  const conteudo = document.getElementById("podiumContent");
  let leitores = LEITORES;

  document.querySelectorAll("[data-filter]").forEach(function (botao) {
    botao.classList.toggle("active", botao.dataset.filter === filtro);
  });

  if (filtro === "amizades") {
    // FALHA: o usuário ainda não tem amizades cadastradas
    if (state.amizades.length === 0) {
      conteudo.hidden = true;
      showFeedback("podiumFeedback", "O pódio entre amizades não pôde ser mostrado: você ainda não tem amizades cadastradas. Adicione amizades no seu perfil.", true);
      return;
    }

    // SUCESSO: o pódio é mostrado só entre as amizades do usuário
    leitores = LEITORES.filter(function (l) { return state.amizades.includes(l.id); });
  }

  showFeedback("podiumFeedback", "", false);
  conteudo.hidden = false;

  // junta o usuário aos outros leitores e ordena por pontos
  const classificacao = leitores.concat([myReader()]).sort(function (a, b) {
    return calcPoints(b) - calcPoints(a);
  });
  const medalhas = ["🥇", "🥈", "🥉"];

  document.getElementById("podium").innerHTML = classificacao.slice(0, 3).map(function (leitor, i) {
    return `<div class="podium-item${i === 0 ? " first" : ""}">
      <div class="medal">${medalhas[i]}</div>
      <strong>${escapeHtml(leitor.nome)}</strong>
      <p>${formatNumber(calcPoints(leitor))} pontos</p>
    </div>`;
  }).join("");

  document.getElementById("rankingBody").innerHTML = classificacao.map(function (leitor, i) {
    return `<tr>
      <td>${i + 1}º</td>
      <td>${escapeHtml(leitor.nome)}</td>
      <td>${leitor.livros}</td>
      <td>${leitor.horas}h</td>
      <td>${formatNumber(leitor.paginas)}</td>
      <td><strong>${formatNumber(calcPoints(leitor))}</strong></td>
    </tr>`;
  }).join("");
}

// ---- PBI-03: abrir a aba Ranking (progresso do usuário) ----
function renderMyProgress() {
  const dados = document.getElementById("progressData");

  // FALHA: o usuário ainda não inseriu dados nem iniciou nenhuma leitura
  if (state.livros.length === 0 && state.tempoSeg === 0) {
    dados.hidden = true;
    showFeedback("myProgressFeedback", "O progresso não pôde ser mostrado: você ainda não inseriu dados nem iniciou nenhuma leitura.", true);
    return;
  }

  // SUCESSO: mostra o progresso com os dados mensurados do usuário
  showFeedback("myProgressFeedback", "", false);
  dados.hidden = false;
  renderStats();

  const eu = myReader();
  const posicao = LEITORES.filter(function (l) { return calcPoints(l) > calcPoints(eu); }).length + 1;
  document.getElementById("progressPosition").textContent =
    "Você está em " + posicao + "º lugar entre " + (LEITORES.length + 1) + " leitores, com " + formatNumber(calcPoints(eu)) + " pontos.";

  // comparação com a média dos outros leitores
  function media(campo) {
    return LEITORES.reduce(function (soma, l) { return soma + l[campo]; }, 0) / LEITORES.length;
  }
  document.getElementById("progressCompare").innerHTML = `
    <tr><td>Livros lidos</td><td>${eu.livros}</td><td>${formatNumber(media("livros"))}</td></tr>
    <tr><td>Tempo de leitura</td><td>${eu.horas}h</td><td>${formatNumber(media("horas"))}h</td></tr>
    <tr><td>Páginas lidas</td><td>${formatNumber(eu.paginas)}</td><td>${formatNumber(media("paginas"))}</td></tr>`;
}

if (tabPodio && tabProgresso) {
  renderPodium("todos");

  tabPodio.addEventListener("click", function () {
    tabPodio.classList.add("active");
    tabProgresso.classList.remove("active");
    document.getElementById("panelPodio").hidden = false;
    document.getElementById("panelProgresso").hidden = true;
  });

  tabProgresso.addEventListener("click", function () {
    tabProgresso.classList.add("active");
    tabPodio.classList.remove("active");
    document.getElementById("panelPodio").hidden = true;
    document.getElementById("panelProgresso").hidden = false;
    renderMyProgress();
  });

  document.querySelectorAll("[data-filter]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      renderPodium(botao.dataset.filter);
    });
  });
}

// ---- PBI-05: receber sugestão de livro novo (notificações) ----
const notifList = document.getElementById("notifList");

function renderNotifications() {
  document.getElementById("notifCount").textContent = state.notificacoes.length + " de " + LIMITE_NOTIFICACOES + " ativas";

  notifList.innerHTML = TIPOS_NOTIFICACAO.map(function (tipo) {
    const ativa = state.notificacoes.includes(tipo.id);
    return `<label class="setting-row">
      <input type="checkbox" data-notif="${tipo.id}"${ativa ? " checked" : ""}>
      <span>${tipo.nome}</span>
    </label>`;
  }).join("");

  document.getElementById("notifInbox").innerHTML = state.avisos.length === 0
    ? "<li>Nenhuma notificação recebida ainda.</li>"
    : state.avisos.map(function (aviso) { return `<li>🔔 ${aviso}</li>`; }).join("");
}

if (notifList) {
  // ao abrir a página, as notificações recebidas contam como vistas
  state.avisosNovos = 0;
  saveState();
  renderNotifications();

  notifList.addEventListener("change", function (evento) {
    const campo = evento.target;
    const tipo = TIPOS_NOTIFICACAO.find(function (t) { return t.id === campo.dataset.notif; });

    // Desativar sempre é permitido
    if (!campo.checked) {
      state.notificacoes = state.notificacoes.filter(function (n) { return n !== tipo.id; });
      saveState();
      renderNotifications();
      showFeedback("notifFeedback", "Notificação \"" + tipo.nome + "\" desativada.", false);
      return;
    }

    // FALHA: o usuário já atingiu o limite de notificações configuradas
    if (state.notificacoes.length >= LIMITE_NOTIFICACOES) {
      campo.checked = false;
      showFeedback("notifFeedback", "Limite de notificações atingido (" + LIMITE_NOTIFICACOES + " de " + LIMITE_NOTIFICACOES + "). Não foi possível configurar a notificação \"" + tipo.nome + "\".", true);
      return;
    }

    // SUCESSO: a notificação fica ativa; se for a de sugestão, a primeira sugestão já chega
    state.notificacoes.push(tipo.id);
    let mensagem = "Notificação \"" + tipo.nome + "\" ativada.";
    if (tipo.id === "sugestoes") {
      const meusLivros = state.livros.map(function (l) { return l.livroId; });
      const livro = LIVROS.find(function (l) { return !meusLivros.includes(l.id); });
      if (livro) {
        state.avisos.unshift("Sugestão de livro novo: " + livro.titulo + ", de " + livro.autor + ".");
        state.avisosNovos += 1;
        mensagem += " A primeira sugestão já chegou nas notificações recebidas.";
      }
    }
    saveState();
    renderNotifications();
    renderNav();
    showFeedback("notifFeedback", mensagem, false);
  });
}

// ---- PBI-06: revisar informações cadastradas (moderador) ----
const bookQueue = document.getElementById("bookQueue");

// Campos que ainda não foram preenchidos no cadastro
function pendingFields(cadastro) {
  return CAMPOS_CADASTRO.filter(function (campo) {
    return cadastro[campo.chave] === null || cadastro[campo.chave] === "";
  });
}

function renderBookQueue() {
  bookQueue.innerHTML = CADASTROS.map(function (cadastro) {
    let situacao = '<span class="status lendo">Cadastro concluído</span>';
    if (pendingFields(cadastro).length > 0) situacao = '<span class="status pendente">Em cadastramento</span>';
    if (state.confirmados.includes(cadastro.id)) situacao = '<span class="status concluido">Confirmado</span>';

    return `<tr>
      <td><strong>${cadastro.titulo}</strong></td>
      <td>${situacao}</td>
      <td><button class="btn btn-small btn-outline" data-review="${cadastro.id}">Revisar</button></td>
    </tr>`;
  }).join("");
}

function reviewBook(id) {
  const cadastro = CADASTROS.find(function (c) { return c.id === id; });
  const pendentes = pendingFields(cadastro);
  const confirmBtn = document.getElementById("confirmBookBtn");

  document.getElementById("reviewPanel").hidden = false;
  document.getElementById("reviewInfo").innerHTML = CAMPOS_CADASTRO.map(function (campo) {
    const valor = pendentes.includes(campo) ? '<span class="pending">Pendente</span>' : cadastro[campo.chave];
    return `<tr><th>${campo.nome}</th><td>${valor}</td></tr>`;
  }).join("");

  confirmBtn.dataset.id = id;
  confirmBtn.hidden = true;

  // FALHA: o livro ainda está em processo de cadastramento
  if (pendentes.length > 0) {
    const nomes = pendentes.map(function (campo) { return campo.nome; }).join(", ");
    showFeedback("reviewFeedback", "Existem informações pendentes de atualização antes da confirmação: " + nomes + ".", true);
    return;
  }

  // SUCESSO: todas as informações cadastradas são exibidas para o moderador confirmar
  if (state.confirmados.includes(id)) {
    showFeedback("reviewFeedback", "Este livro já foi confirmado.", false);
    return;
  }
  showFeedback("reviewFeedback", "Cadastro concluído. Confira as informações abaixo e confirme os dados do livro.", false);
  confirmBtn.hidden = false;
}

if (bookQueue) {
  renderBookQueue();

  bookQueue.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-review]");
    if (botao) reviewBook(botao.dataset.review);
  });

  document.getElementById("confirmBookBtn").addEventListener("click", function () {
    state.confirmados.push(this.dataset.id);
    saveState();
    renderBookQueue();
    this.hidden = true;
    showFeedback("reviewFeedback", "Livro confirmado na plataforma.", false);
  });
}

// ---- PBI-10: perfil do usuário ----
const profileName = document.getElementById("profileName");

function renderProfile() {
  profileName.textContent = state.nome;
  document.getElementById("profileBio").textContent = state.bio;
  document.getElementById("profileAvatar").textContent = initials(state.nome);
}

// Lista de leitores com o botão para adicionar ou remover a amizade
function renderFriends() {
  document.getElementById("friendList").innerHTML = LEITORES.map(function (leitor) {
    const amigo = state.amizades.includes(leitor.id);
    return `<li>
      <span>${leitor.nome}${amigo ? ' <span class="tag">Amizade</span>' : ""}</span>
      <button class="btn btn-small${amigo ? " btn-outline" : ""}" data-friend="${leitor.id}">${amigo ? "Remover" : "Adicionar"}</button>
    </li>`;
  }).join("");
}

if (profileName) {
  renderProfile();
  renderFriends();

  document.getElementById("friendList").addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-friend]");
    if (!botao) return;

    const id = botao.dataset.friend;
    if (state.amizades.includes(id)) state.amizades = state.amizades.filter(function (a) { return a !== id; });
    else state.amizades.push(id);
    saveState();
    renderFriends();
    renderStats();
  });

  // Editar as informações do perfil
  const editBtn = document.getElementById("editInfoBtn");
  const infoInputs = document.querySelectorAll(".editable-field");
  const nomeInput = document.getElementById("nomeInput");
  const bioInput = document.getElementById("bioInput");
  nomeInput.value = state.nome;
  bioInput.value = state.bio;

  editBtn.addEventListener("click", function () {
    const estaBloqueado = infoInputs[0].disabled;

    if (!estaBloqueado) {
      // FALHA: o nome não pode ficar vazio
      if (nomeInput.value.trim() === "") {
        showFeedback("profileFeedback", "Informe o seu nome para salvar o perfil.", true);
        return;
      }
      state.nome = nomeInput.value.trim();
      state.bio = bioInput.value.trim();
      saveState();
      renderProfile();
      renderNav();
      showFeedback("profileFeedback", "Informações atualizadas.", false);
    }

    infoInputs.forEach(function (input) {
      input.disabled = !estaBloqueado;
    });
    editBtn.textContent = estaBloqueado ? "Salvar informações" : "Editar informações";
  });

  // Apaga os livros e o tempo de leitura (o nome e as amizades continuam)
  document.getElementById("clearReadingBtn").addEventListener("click", function () {
    if (!confirm("Deseja apagar o seu histórico e o seu tempo de leitura?")) return;
    state.livros = [];
    state.tempoSeg = 0;
    state.sessaoInicio = null;
    saveState();
    renderStats();
    showFeedback("accountFeedback", "Dados de leitura apagados.", false);
  });

  // Volta a conta para os dados de exemplo do primeiro acesso
  document.getElementById("resetDemoBtn").addEventListener("click", function () {
    if (!confirm("Deseja restaurar os dados de exemplo?")) return;
    localStorage.removeItem(CHAVE_ESTADO);
    location.reload();
  });
}

renderNav();
renderStats();
renderProgress();