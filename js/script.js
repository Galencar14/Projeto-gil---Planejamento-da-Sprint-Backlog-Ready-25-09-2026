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

// Função utilitária para mostrar mensagens de feedback ao usuário
function showFeedback(elementId, mensagem, erro) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensagem;
  el.style.color = erro ? "#b23b3b" : "#2f4b3c";
}

// ---- PBI-04: contabilizar os livros concluídos no Pódio (filtro Todos / Amizades) ----
const podiumEl = document.getElementById("podium");
const podiumTable = document.getElementById("podiumTable");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearFriendsBtn = document.getElementById("clearFriendsBtn");

// Leitores da plataforma (dados fictícios do MVP)
const leitores = [
  { nome: "Mariana Costa", livros: 32, paginas: 8450, horas: 210 },
  { nome: "João Pedro", livros: 27, paginas: 7120, horas: 185 },
  { nome: "Ana Beatriz", livros: 24, paginas: 6890, horas: 170 },
  { nome: "Lucas Almeida", livros: 19, paginas: 5230, horas: 132 },
  { nome: "Carla Souza", livros: 15, paginas: 4310, horas: 98 },
  { nome: "Rafael Lima", livros: 9, paginas: 2540, horas: 61 }
];

// Pontuação: 100 por livro concluído + 5 por hora de leitura + 1 a cada 10 páginas
function calcularPontos(leitor) {
  return leitor.livros * 100 + leitor.horas * 5 + Math.floor(leitor.paginas / 10);
}

// Dados do próprio usuário, contabilizados a partir do que ele registrou (PBI-07 e PBI-08)
function getLeitorAtual() {
  const historico = JSON.parse(localStorage.getItem("letterbook_historico") || "[]");
  const paginaSalva = localStorage.getItem("letterbook_pagina");
  const paginas = paginaSalva === null ? 0 : parseInt(paginaSalva);
  return { nome: "Você", livros: historico.length, paginas: paginas, horas: Math.round((paginas * 2) / 60), voce: true };
}

function getAmizades() {
  return JSON.parse(localStorage.getItem("letterbook_amizades") || "[]");
}

function salvarAmizades(lista) {
  localStorage.setItem("letterbook_amizades", JSON.stringify(lista));
}

let filtroAtual = "todos";

function renderPodium() {
  if (!podiumEl || !podiumTable) return;

  const amizades = getAmizades();
  let lista = leitores.concat([getLeitorAtual()]);

  if (filtroAtual === "amizades") {
    lista = lista.filter(function (l) { return l.voce || amizades.indexOf(l.nome) !== -1; });
  }

  lista.forEach(function (l) { l.pontos = calcularPontos(l); });
  lista.sort(function (a, b) { return b.pontos - a.pontos; });

  // Pódio: 2º, 1º, 3º (o 1º fica no meio)
  const medalhas = ["🥇", "🥈", "🥉"];
  const ordemPodio = [1, 0, 2];
  podiumEl.innerHTML = "";
  ordemPodio.forEach(function (i) {
    const l = lista[i];
    if (!l) return;
    const item = document.createElement("div");
    item.className = "podium-item" + (i === 0 ? " first" : "");
    item.innerHTML =
      '<div class="card-cover" style="height:70px; font-size:1.6rem;">' + medalhas[i] + "</div>" +
      "<strong></strong><p>" + l.pontos.toLocaleString("pt-BR") + " pts · " + l.livros + " livros</p>";
    item.querySelector("strong").textContent = l.nome;
    podiumEl.appendChild(item);
  });

  // Tabela completa
  podiumTable.innerHTML = "";
  lista.forEach(function (l, i) {
    const tr = document.createElement("tr");
    if (l.voce) tr.className = "row-you";
    const ehAmigo = amizades.indexOf(l.nome) !== -1;
    tr.innerHTML =
      "<td>" + (i + 1) + "º</td><td class=\"nome\"></td>" +
      "<td>" + l.livros + "</td>" +
      "<td>" + l.paginas.toLocaleString("pt-BR") + "</td>" +
      "<td>" + l.horas + "h</td>" +
      "<td><strong>" + l.pontos.toLocaleString("pt-BR") + "</strong></td>" +
      "<td></td>";
    tr.querySelector(".nome").textContent = l.nome;

    if (!l.voce) {
      const btn = document.createElement("button");
      btn.className = "btn btn-small" + (ehAmigo ? " btn-outline" : "");
      btn.textContent = ehAmigo ? "Desfazer amizade" : "Adicionar amizade";
      btn.addEventListener("click", function () { alternarAmizade(l.nome); });
      tr.lastChild.appendChild(btn);
    } else {
      tr.lastChild.textContent = "—";
    }
    podiumTable.appendChild(tr);
  });

  filterBtns.forEach(function (b) {
    b.classList.toggle("active", b.dataset.filtro === filtroAtual);
  });
}

function alternarAmizade(nome) {
  const amizades = getAmizades();
  const pos = amizades.indexOf(nome);
  if (pos === -1) amizades.push(nome); else amizades.splice(pos, 1);
  salvarAmizades(amizades);

  // Se ficou sem amizades enquanto o filtro estava em "Amizades", volta para "Todos"
  if (filtroAtual === "amizades" && amizades.length === 0) {
    filtroAtual = "todos";
    showFeedback("podiumFeedback", "Você não tem mais amizades cadastradas. Exibindo o pódio de todos.", true);
  }
  renderPodium();
}

filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const filtro = btn.dataset.filtro;

    // FALHA: o usuário ainda não tem amizades cadastradas
    if (filtro === "amizades" && getAmizades().length === 0) {
      showFeedback("podiumFeedback", "Não é possível mostrar o pódio entre amizades: você ainda não tem amizades cadastradas. Use \"Adicionar amizade\" na tabela.", true);
      return; // mantém o filtro atual
    }

    // SUCESSO: mostra o pódio filtrado
    filtroAtual = filtro;
    renderPodium();
    showFeedback("podiumFeedback", filtro === "amizades" ? "Pódio entre você e suas amizades." : "Pódio entre todos os leitores.", false);
  });
});

if (clearFriendsBtn) {
  clearFriendsBtn.addEventListener("click", function () {
    salvarAmizades([]);
    filtroAtual = "todos";
    renderPodium();
    showFeedback("podiumFeedback", "Amizades removidas.", false);
  });
}

renderPodium();
