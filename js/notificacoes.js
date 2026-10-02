// ===== LetterBook — PBI-05: Receber sugestão de livro novo =====
// Responsável: Artur Barbosa Lobato
//
// Critério de SUCESSO: na aba de configurar notificações, o usuário confirma que quer
// receber sugestões de livro novo -> a notificação é ativada e chegam sugestões.
// Critério de FALHA: o usuário já atingiu o limite de notificações configuradas ->
// o sistema não permite ativar a notificação de sugestão de livro novo.
//
// Os dados ficam salvos no navegador (localStorage), igual ao PBI-07/08.

const LIMITE_NOTIFICACOES = 3;
const CHAVE_NOTIF = "letterbook_notificacoes";      // notificações ativas
const CHAVE_CAIXA = "letterbook_caixa_sugestoes";    // sugestões recebidas

// Livros que podem ser sugeridos (dados mockados, os mesmos da página Sugestões)
const livrosSugeridos = [
  { titulo: "Duna", autor: "Frank Herbert", genero: "Ficção Científica" },
  { titulo: "Sapiens", autor: "Yuval Noah Harari", genero: "Não-ficção" },
  { titulo: "A Menina que Roubava Livros", autor: "Markus Zusak", genero: "Drama" }
];

// Estado inicial da demonstração: o usuário já tem 2 notificações ativas
function getNotificacoes() {
  const salvo = localStorage.getItem(CHAVE_NOTIF);
  return salvo === null ? ["lembrete_leitura", "novidades_comunidades"] : JSON.parse(salvo);
}

function salvarNotificacoes(lista) {
  localStorage.setItem(CHAVE_NOTIF, JSON.stringify(lista));
}

function sugestaoAtiva() {
  return getNotificacoes().includes("sugestao_livro");
}

// Atualiza contador, checkboxes, status e a caixa de notificações
function renderNotificacoes() {
  const ativas = getNotificacoes();

  const countEl = document.getElementById("notifCount");
  const limitEl = document.getElementById("notifLimit");
  if (countEl) countEl.textContent = ativas.length;
  if (limitEl) limitEl.textContent = LIMITE_NOTIFICACOES;

  document.querySelectorAll(".notif-check").forEach(function (check) {
    check.checked = ativas.includes(check.dataset.notif);
  });

  const statusEl = document.getElementById("suggestionStatus");
  if (statusEl) statusEl.textContent = sugestaoAtiva() ? "Ativada ✓" : "Desativada";

  const enableBtn = document.getElementById("enableSuggestionBtn");
  if (enableBtn) {
    enableBtn.textContent = sugestaoAtiva()
      ? "Desativar sugestões de livro novo"
      : "Confirmar: receber sugestões de livro novo";
  }

  renderCaixa();
}

// Mostra as sugestões que "chegaram" por notificação
function renderCaixa() {
  const inbox = document.getElementById("inbox");
  if (!inbox) return;

  const recebidas = JSON.parse(localStorage.getItem(CHAVE_CAIXA) || "[]");
  inbox.innerHTML = "";

  if (recebidas.length === 0) {
    inbox.innerHTML = '<p id="inboxEmpty">Nenhuma notificação de sugestão ainda.</p>';
    return;
  }

  recebidas.slice().reverse().forEach(function (n) {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML =
      "<div><strong>🔔 Nova sugestão: " + n.titulo + "</strong>" +
      '<p style="margin:2px 0 0;">' + n.autor + " · " + n.genero + " · recebida em " + n.data + "</p></div>" +
      '<span class="status concluido">Nova</span>';
    inbox.appendChild(item);
  });
}

// Simula a chegada de uma sugestão (no sistema real viria do servidor)
function enviarSugestao() {
  const recebidas = JSON.parse(localStorage.getItem(CHAVE_CAIXA) || "[]");
  const livro = livrosSugeridos[recebidas.length % livrosSugeridos.length];
  recebidas.push({
    titulo: livro.titulo,
    autor: livro.autor,
    genero: livro.genero,
    data: new Date().toLocaleDateString("pt-BR")
  });
  localStorage.setItem(CHAVE_CAIXA, JSON.stringify(recebidas));
}

// ---- Botão principal: confirmar receber sugestões ----
const enableSuggestionBtn = document.getElementById("enableSuggestionBtn");

if (enableSuggestionBtn) {
  renderNotificacoes();

  enableSuggestionBtn.addEventListener("click", function () {
    const ativas = getNotificacoes();

    // Se já estiver ativa, o botão serve para desativar
    if (ativas.includes("sugestao_livro")) {
      salvarNotificacoes(ativas.filter(function (n) { return n !== "sugestao_livro"; }));
      renderNotificacoes();
      showFeedback("notifFeedback", "Notificação de sugestão de livro novo desativada.", false);
      return;
    }

    // FALHA: o usuário já atingiu o limite de notificações configuradas
    if (ativas.length >= LIMITE_NOTIFICACOES) {
      showFeedback(
        "notifFeedback",
        "Você já atingiu o limite de " + LIMITE_NOTIFICACOES + " notificações configuradas. " +
        "Não é possível ativar a sugestão de livro novo. Desative outra notificação e tente de novo.",
        true
      );
      renderNotificacoes(); // garante que nada mudou na tela
      return;
    }

    // SUCESSO: ativa a notificação e já chega a primeira sugestão
    ativas.push("sugestao_livro");
    salvarNotificacoes(ativas);
    enviarSugestao();
    renderNotificacoes();
    showFeedback("notifFeedback", "Pronto! Você vai receber sugestões de livro novo. A primeira já chegou abaixo.", false);
  });
}

// ---- Checkboxes das outras notificações (também respeitam o limite) ----
document.querySelectorAll(".notif-check").forEach(function (check) {
  check.addEventListener("change", function () {
    let ativas = getNotificacoes();
    const tipo = check.dataset.notif;

    if (check.checked) {
      if (ativas.length >= LIMITE_NOTIFICACOES) {
        check.checked = false;
        showFeedback("notifFeedback", "Limite de " + LIMITE_NOTIFICACOES + " notificações atingido.", true);
        return;
      }
      ativas.push(tipo);
    } else {
      ativas = ativas.filter(function (n) { return n !== tipo; });
    }

    salvarNotificacoes(ativas);
    renderNotificacoes();
    showFeedback("notifFeedback", "", false);
  });
});

// ---- Botão só para demonstração: volta ao estado inicial ----
const resetNotifBtn = document.getElementById("resetNotifBtn");
if (resetNotifBtn) {
  resetNotifBtn.addEventListener("click", function () {
    localStorage.removeItem(CHAVE_NOTIF);
    localStorage.removeItem(CHAVE_CAIXA);
    location.reload();
  });
}

// ---- Na página Sugestões: mostra se a notificação está ativa ----
const suggestionBanner = document.getElementById("suggestionBanner");
if (suggestionBanner) {
  suggestionBanner.textContent = sugestaoAtiva()
    ? "🔔 Você está recebendo notificações de sugestão de livro novo."
    : "🔕 Notificações de sugestão de livro novo desativadas.";
}
