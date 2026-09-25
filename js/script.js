// ===== LetterBook — interações básicas do MVP =====

// Menu mobile (abre/fecha os links de navegação)
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// ---- PBI-07: atualizar página atual do livro ----
const updateBtn = document.getElementById("updatePageBtn");
const pageInput = document.getElementById("pageInput");
const currentPageEl = document.getElementById("currentPageValue");
const progressFill = document.getElementById("progressFill");
const totalPages = 662; // total de páginas do livro fictício em leitura

if (updateBtn && pageInput && currentPageEl) {
  updateBtn.addEventListener("click", function () {
    const novaPagina = parseInt(pageInput.value);

    if (isNaN(novaPagina) || novaPagina < 0 || novaPagina > totalPages) {
      showFeedback("progressFeedback", "Informe uma página válida (0 a " + totalPages + ").", true);
      return;
    }

    currentPageEl.textContent = novaPagina;

    if (progressFill) {
      const porcentagem = (novaPagina / totalPages) * 100;
      progressFill.style.width = porcentagem + "%";
    }

    showFeedback("progressFeedback", "Progresso atualizado!", false);
    pageInput.value = "";
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
