// ===== LetterBook — interações básicas do MVP =====

// Menu mobile (abre/fecha os links de navegação)
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// ---- PBI-07: informar a página atual do livro ----
const updateBtn = document.getElementById("updatePageBtn");
const pageInput = document.getElementById("pageInput");
const currentPageEl = document.getElementById("currentPageValue");
const progressFill = document.getElementById("progressFill");
const totalPages = 662; // total de páginas do livro fictício em leitura

// Lê a página salva no navegador (localStorage). Se não tiver nada salvo, começa na 214.
function getSavedPage() {
  const salva = localStorage.getItem("letterbook_pagina");
  return salva === null ? 214 : parseInt(salva);
}

// Mostra na tela a página salva e a barra de progresso
function renderProgress() {
  const pagina = getSavedPage();
  if (currentPageEl) currentPageEl.textContent = pagina;
  if (progressFill) progressFill.style.width = (pagina / totalPages) * 100 + "%";
}

renderProgress();

if (updateBtn && pageInput && currentPageEl) {
  updateBtn.addEventListener("click", function () {
    const texto = pageInput.value.trim();
    const novaPagina = Number(texto);

    // FALHA: campo vazio, número com vírgula/ponto, menor que 1 ou maior que o total
    if (texto === "" || !Number.isInteger(novaPagina) || novaPagina < 1 || novaPagina > totalPages) {
      showFeedback("progressFeedback", "É necessário inserir uma página válida (de 1 a " + totalPages + "). A página não foi registrada.", true);
      return; // sai sem salvar nada
    }

    // SUCESSO: salva a página e atualiza o progresso
    localStorage.setItem("letterbook_pagina", novaPagina);
    renderProgress();
    showFeedback("progressFeedback", "Página " + novaPagina + " registrada! Progresso atualizado.", false);
    pageInput.value = "";
  });
}

// ---- PBI-08: registrar o livro no histórico de leitura ----
const finishBtn = document.getElementById("finishBookBtn");
const bookStatusEl = document.getElementById("bookStatus");
const resetBtn = document.getElementById("resetDemoBtn");

// O livro está concluído quando esse valor está salvo no navegador
function bookIsFinished() {
  return localStorage.getItem("letterbook_concluido") === "sim";
}

// Ajusta a tela quando o livro já foi concluído
function renderFinishedState() {
  if (!finishBtn || !bookIsFinished()) return;
  if (bookStatusEl) bookStatusEl.textContent = "Concluído ✓";
  if (updateBtn) updateBtn.disabled = true;
  if (pageInput) pageInput.disabled = true;
}

if (finishBtn) {
  renderFinishedState();

  finishBtn.addEventListener("click", function () {
    // FALHA 1: não existe livro em leitura (ele já foi concluído)
    if (bookIsFinished()) {
      showFeedback("finishFeedback", "Não há nenhum livro em leitura. O status do livro foi mantido.", true);
      return;
    }

    // FALHA 2: o livro ainda não chegou na última página
    if (getSavedPage() < totalPages) {
      showFeedback("finishFeedback", "Você ainda não chegou na última página (" + totalPages + "). O livro só pode ser concluído na última página.", true);
      return;
    }

    // FALHA 3: o usuário não confirmou a ação
    const confirmou = confirm("Deseja marcar \"O Nome do Vento\" como concluído?");
    if (!confirmou) {
      showFeedback("finishFeedback", "Ação não confirmada. O livro continua em leitura.", true);
      return;
    }

    // SUCESSO: marca como concluído, progresso em 100% e registra no histórico
    localStorage.setItem("letterbook_concluido", "sim");
    localStorage.setItem("letterbook_pagina", totalPages);

    const historico = JSON.parse(localStorage.getItem("letterbook_historico") || "[]");
    historico.push({
      titulo: "O Nome do Vento",
      concluidoEm: new Date().toLocaleDateString("pt-BR")
    });
    localStorage.setItem("letterbook_historico", JSON.stringify(historico));

    renderProgress();
    renderFinishedState();
    showFeedback("finishFeedback", "Livro concluído e registrado no histórico! Progresso: 100%.", false);
  });
}

// Botão só para demonstração: limpa os dados salvos para testar de novo
if (resetBtn) {
  resetBtn.addEventListener("click", function () {
    localStorage.removeItem("letterbook_pagina");
    localStorage.removeItem("letterbook_concluido");
    localStorage.removeItem("letterbook_historico");
    location.reload();
  });
}

// ---- PBI-01: iniciar sessão de leitura (visual) ----
const startSessionBtn = document.getElementById("startSessionBtn");
const sessionBox = document.getElementById("sessionBox");

if (startSessionBtn && sessionBox) {
  startSessionBtn.addEventListener("click", function () {
    sessionBox.textContent = "Sessão de leitura em andamento... (cronômetro em breve)";
    startSessionBtn.textContent = "Sessão iniciada";
    startSessionBtn.disabled = true;
  });
}

// ---- PBI-02: entrar em comunidade (visual) ----
document.querySelectorAll(".join-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    btn.textContent = "Você entrou ✓";
    btn.disabled = true;
  });
});

// ---- PBI-06: editar informações (visual) ----
const editBtn = document.getElementById("editInfoBtn");
const infoInputs = document.querySelectorAll(".editable-field");

if (editBtn && infoInputs.length > 0) {
  editBtn.addEventListener("click", function () {
    const estaBloqueado = infoInputs[0].disabled;
    infoInputs.forEach(function (input) {
      input.disabled = !estaBloqueado;
    });
    editBtn.textContent = estaBloqueado ? "Salvar informações" : "Editar informações";
  });
}

// ---- PBI-03: abrir a aba Ranking e ver o próprio progresso ----
const showProgressBtn = document.getElementById("showProgressBtn");
const progressPanel = document.getElementById("progressPanel");

// Junta os dados de leitura que o usuário já registrou (PBI-07 e PBI-08)
function getUserReadingData() {
  const paginaSalva = localStorage.getItem("letterbook_pagina");
  const historico = JSON.parse(localStorage.getItem("letterbook_historico") || "[]");
  const paginas = paginaSalva === null ? 0 : parseInt(paginaSalva);

  return {
    temDados: paginaSalva !== null || historico.length > 0,
    livros: historico.length,
    paginas: paginas,
    minutos: paginas * 2 // estimativa: 2 minutos por página
  };
}

// Lê os outros usuários direto da tabela do ranking (colunas: nome, livros, páginas)
function getRankingUsers() {
  const linhas = document.querySelectorAll("table tbody tr");
  const usuarios = [];
  linhas.forEach(function (linha) {
    const colunas = linha.querySelectorAll("td");
    if (colunas.length < 4) return;
    usuarios.push({
      nome: colunas[1].textContent.trim(),
      livros: parseInt(colunas[2].textContent.replace(/\./g, "")) || 0,
      paginas: parseInt(colunas[3].textContent.replace(/\./g, "")) || 0
    });
  });
  return usuarios;
}

function formatarTempo(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas + "h" + (resto > 0 ? " " + resto + "min" : "");
}

if (showProgressBtn && progressPanel) {
  showProgressBtn.addEventListener("click", function () {
    const dados = getUserReadingData();

    // FALHA: o usuário ainda não inseriu dados nem iniciou nenhuma leitura
    if (!dados.temDados) {
      progressPanel.hidden = true;
      showFeedback("rankingProgressFeedback", "Não há dados de leitura para exibir. Registre uma página em \"Registrar Progresso\" ou inicie uma leitura primeiro.", true);
      return;
    }

    // SUCESSO: mostra os dados mensurados do usuário
    const outros = getRankingUsers();
    const posicao = 1 + outros.filter(function (u) {
      return u.livros > dados.livros || (u.livros === dados.livros && u.paginas > dados.paginas);
    }).length;
    const mediaPaginas = outros.length === 0 ? 0 : Math.round(outros.reduce(function (soma, u) { return soma + u.paginas; }, 0) / outros.length);
    const mediaLivros = outros.length === 0 ? 0 : (outros.reduce(function (soma, u) { return soma + u.livros; }, 0) / outros.length).toFixed(1);
    const percentual = Math.min(100, Math.round((dados.paginas / totalPages) * 100));

    document.getElementById("statLivros").textContent = dados.livros;
    document.getElementById("statPaginas").textContent = dados.paginas.toLocaleString("pt-BR");
    document.getElementById("statTempo").textContent = formatarTempo(dados.minutos);
    document.getElementById("statPosicao").textContent = posicao + "º";

    document.getElementById("compareSelf").textContent =
      "Livro atual (O Nome do Vento): " + percentual + "% lido — página " + dados.paginas + " de " + totalPages + ".";
    document.getElementById("rankingProgressFill").style.width = percentual + "%";

    document.getElementById("compareOthers").textContent =
      "Você ficaria em " + posicao + "º lugar entre " + (outros.length + 1) + " leitores. " +
      "Média dos outros usuários: " + mediaLivros.toString().replace(".", ",") + " livros e " + mediaPaginas.toLocaleString("pt-BR") + " páginas.";

    progressPanel.hidden = false;
    showFeedback("rankingProgressFeedback", "Progresso carregado com seus dados de leitura.", false);
  });
}

// Função utilitária para mostrar mensagens de feedback ao usuário
function showFeedback(elementId, mensagem, erro) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensagem;
  el.style.color = erro ? "#b23b3b" : "#2f4b3c";
}
