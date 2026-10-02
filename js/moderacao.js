// ===== LetterBook — PBI-06: Revisar informações cadastradas =====
// Responsável: Artur Barbosa Lobato
//
// Critério de SUCESSO: na área de gerenciamento de livros, com o cadastro do livro concluído,
// o moderador revisa as informações -> o sistema exibe todas as informações para ele confirmar.
// Critério de FALHA: o livro ainda está em processo de cadastramento -> o sistema informa
// que existem informações pendentes de atualização antes da confirmação.
//
// Os livros são dados mockados. O status "Confirmado" fica salvo no navegador (localStorage).

const CHAVE_CONFIRMADOS = "letterbook_livros_confirmados";

// Campos que todo livro precisa ter para poder ser confirmado
const camposObrigatorios = [
  { chave: "titulo", rotulo: "Título" },
  { chave: "autor", rotulo: "Autor" },
  { chave: "genero", rotulo: "Gênero" },
  { chave: "paginas", rotulo: "Total de páginas" },
  { chave: "editora", rotulo: "Editora" },
  { chave: "ano", rotulo: "Ano de publicação" },
  { chave: "isbn", rotulo: "ISBN" }
];

// Livros enviados pelos usuários (dados mockados)
const livrosCadastrados = [
  {
    id: "hobbit",
    titulo: "O Hobbit",
    autor: "J.R.R. Tolkien",
    genero: "Fantasia",
    paginas: "336",
    editora: "HarperCollins",
    ano: "2019",
    isbn: "978-8595084742",
    enviadoPor: "Mariana Costa",
    cadastroConcluido: true
  },
  {
    id: "revolucao",
    titulo: "A Revolução dos Bichos",
    autor: "George Orwell",
    genero: "Fábula",
    paginas: "",
    editora: "",
    ano: "2007",
    isbn: "",
    enviadoPor: "João Pedro",
    cadastroConcluido: false
  },
  {
    id: "torto",
    titulo: "Torto Arado",
    autor: "Itamar Vieira Junior",
    genero: "Romance",
    paginas: "264",
    editora: "Todavia",
    ano: "2019",
    isbn: "978-6580309313",
    enviadoPor: "Ana Beatriz",
    cadastroConcluido: true
  }
];

let livroEmRevisao = null;

function getConfirmados() {
  return JSON.parse(localStorage.getItem(CHAVE_CONFIRMADOS) || "[]");
}

// Lista os campos obrigatórios que ainda estão vazios
function camposPendentes(livro) {
  return camposObrigatorios
    .filter(function (c) { return !livro[c.chave] || livro[c.chave].trim() === ""; })
    .map(function (c) { return c.rotulo; });
}

function statusDoLivro(livro) {
  if (getConfirmados().includes(livro.id)) return { texto: "Confirmado", classe: "concluido" };
  if (!livro.cadastroConcluido) return { texto: "Em cadastramento", classe: "lendo" };
  return { texto: "Aguardando revisão", classe: "lendo" };
}

// Monta a lista de livros na tela
function renderListaLivros() {
  const lista = document.getElementById("bookList");
  if (!lista) return;
  lista.innerHTML = "";

  livrosCadastrados.forEach(function (livro) {
    const status = statusDoLivro(livro);
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML =
      "<div><strong>" + livro.titulo + "</strong>" +
      '<p style="margin:2px 0 0;">' + livro.autor + " · enviado por " + livro.enviadoPor + "</p></div>" +
      '<div class="field-row" style="margin-top:0;">' +
      '<span class="status ' + status.classe + '">' + status.texto + "</span>" +
      '<button class="btn btn-small review-btn" data-id="' + livro.id + '">Revisar</button>' +
      "</div>";
    lista.appendChild(item);
  });

  document.querySelectorAll(".review-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      revisarLivro(btn.dataset.id);
    });
  });
}

// Abre o painel de revisão de um livro
function revisarLivro(id) {
  const livro = livrosCadastrados.find(function (l) { return l.id === id; });
  const panel = document.getElementById("reviewPanel");
  const fields = document.getElementById("reviewFields");
  const confirmBtn = document.getElementById("confirmBookBtn");
  if (!livro || !panel || !fields || !confirmBtn) return;

  livroEmRevisao = livro;
  panel.hidden = false;
  document.getElementById("reviewTitle").textContent = "Revisão: " + livro.titulo;
  showFeedback("reviewFeedback", "", false);

  const pendentes = camposPendentes(livro);

  // FALHA: o livro ainda está em processo de cadastramento
  if (!livro.cadastroConcluido || pendentes.length > 0) {
    fields.innerHTML = "";
    confirmBtn.hidden = true;
    showFeedback(
      "reviewFeedback",
      "Este livro ainda está em processo de cadastramento. Existem informações pendentes de atualização antes da confirmação: " +
      pendentes.join(", ") + ".",
      true
    );
    panel.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // SUCESSO: exibe todas as informações cadastradas para o moderador confirmar
  fields.innerHTML = "";
  camposObrigatorios.forEach(function (c) {
    const linha = document.createElement("tr");
    linha.innerHTML = "<th>" + c.rotulo + "</th><td>" + livro[c.chave] + "</td>";
    fields.appendChild(linha);
  });
  const linhaEnvio = document.createElement("tr");
  linhaEnvio.innerHTML = "<th>Enviado por</th><td>" + livro.enviadoPor + "</td>";
  fields.appendChild(linhaEnvio);

  const jaConfirmado = getConfirmados().includes(livro.id);
  confirmBtn.hidden = jaConfirmado;
  showFeedback(
    "reviewFeedback",
    jaConfirmado
      ? "Este livro já foi confirmado na plataforma."
      : "Todas as informações foram carregadas. Confira os dados e confirme o livro.",
    false
  );
  panel.scrollIntoView({ behavior: "smooth" });
}

// ---- Botão "Confirmar livro" ----
const confirmBookBtn = document.getElementById("confirmBookBtn");
if (confirmBookBtn) {
  renderListaLivros();

  confirmBookBtn.addEventListener("click", function () {
    if (!livroEmRevisao) return;

    // Segurança extra: nunca confirma livro com cadastro incompleto
    if (!livroEmRevisao.cadastroConcluido || camposPendentes(livroEmRevisao).length > 0) {
      showFeedback("reviewFeedback", "Existem informações pendentes de atualização antes da confirmação.", true);
      return;
    }

    const confirmados = getConfirmados();
    if (!confirmados.includes(livroEmRevisao.id)) confirmados.push(livroEmRevisao.id);
    localStorage.setItem(CHAVE_CONFIRMADOS, JSON.stringify(confirmados));

    confirmBookBtn.hidden = true;
    renderListaLivros();
    showFeedback("reviewFeedback", "\"" + livroEmRevisao.titulo + "\" foi confirmado e já está disponível na plataforma!", false);
  });
}

// ---- Fechar o painel ----
const closeReviewBtn = document.getElementById("closeReviewBtn");
if (closeReviewBtn) {
  closeReviewBtn.addEventListener("click", function () {
    document.getElementById("reviewPanel").hidden = true;
    livroEmRevisao = null;
  });
}

// ---- Botão só para demonstração ----
const resetModeracaoBtn = document.getElementById("resetModeracaoBtn");
if (resetModeracaoBtn) {
  resetModeracaoBtn.addEventListener("click", function () {
    localStorage.removeItem(CHAVE_CONFIRMADOS);
    location.reload();
  });
}
