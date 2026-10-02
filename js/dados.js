// ===== LetterBook — dados da plataforma =====
// Não existe servidor: tudo o que o usuário faz fica salvo no navegador (localStorage).

// ---- Catálogo de livros ----
const LIVROS = [
  { id: "nome-do-vento", titulo: "O Nome do Vento", autor: "Patrick Rothfuss", genero: "Fantasia", paginas: 662, cor: "#6b4423" },
  { id: "1984", titulo: "1984", autor: "George Orwell", genero: "Ficção Científica", paginas: 416, cor: "#7a2e2e" },
  { id: "dom-casmurro", titulo: "Dom Casmurro", autor: "Machado de Assis", genero: "Clássico", paginas: 256, cor: "#2f4b3c" },
  { id: "harry-potter", titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", genero: "Fantasia", paginas: 264, cor: "#2b3a55" },
  { id: "sapiens", titulo: "Sapiens", autor: "Yuval Noah Harari", genero: "Não-ficção", paginas: 464, cor: "#b07a1e" },
  { id: "duna", titulo: "Duna", autor: "Frank Herbert", genero: "Ficção Científica", paginas: 680, cor: "#a5622a" },
  { id: "menina-livros", titulo: "A Menina que Roubava Livros", autor: "Markus Zusak", genero: "Drama", paginas: 480, cor: "#4a5560" },
  { id: "hobbit", titulo: "O Hobbit", autor: "J.R.R. Tolkien", genero: "Fantasia", paginas: 336, cor: "#2e5f5a" }
];

// ---- PBI-06: livros cadastrados pelos leitores, aguardando o moderador ----
// Um campo vazio ("" ou null) significa que o livro ainda está em processo de cadastramento.
const CADASTROS = [
  { id: "torto-arado", titulo: "Torto Arado", autor: "Itamar Vieira Junior", genero: "Drama", paginas: 264, editora: "Todavia", ano: 2019 },
  { id: "biblioteca-meia-noite", titulo: "A Biblioteca da Meia-Noite", autor: "Matt Haig", genero: "Fantasia", paginas: 308, editora: "Bertrand Brasil", ano: 2021 },
  { id: "conto-da-aia", titulo: "O Conto da Aia", autor: "Margaret Atwood", genero: "Ficção Científica", paginas: null, editora: "", ano: 2017 }
];

const CAMPOS_CADASTRO = [
  { chave: "titulo", nome: "Título" },
  { chave: "autor", nome: "Autor" },
  { chave: "genero", nome: "Gênero" },
  { chave: "paginas", nome: "Número de páginas" },
  { chave: "editora", nome: "Editora" },
  { chave: "ano", nome: "Ano de publicação" }
];

// ---- Outros leitores da plataforma (pódio e amizades) ----
const LEITORES = [
  // integrantes do grupo (amizades da conta de exemplo)
  { id: "artur", nome: "Artur Barbosa Lobato", livros: 4, paginas: 1310, horas: 38 },
  { id: "felipe", nome: "Felipe Menezes Alho", livros: 2, paginas: 640, horas: 17 },
  { id: "gustavo", nome: "Gustavo Alencar Lobato", livros: 6, paginas: 1820, horas: 52 },
  { id: "joao", nome: "João Victor Rios Ribeiro", livros: 3, paginas: 890, horas: 27 },
  // outros leitores
  { id: "mariana", nome: "Mariana Costa", livros: 32, paginas: 8450, horas: 212 },
  { id: "ana", nome: "Ana Beatriz", livros: 24, paginas: 6890, horas: 171 },
  { id: "lucas", nome: "Lucas Almeida", livros: 19, paginas: 5230, horas: 133 },
  { id: "rafael", nome: "Rafael Lima", livros: 11, paginas: 3020, horas: 84 },
  { id: "camila", nome: "Camila Rocha", livros: 5, paginas: 1480, horas: 43 }
];

// ---- PBI-02: comunidades de leitores ----
// status: "ativa", "indisponivel" ou "removida"
const COMUNIDADES = [
  {
    id: "fantastico", nome: "Clube do Livro Fantástico", membros: 1240, status: "ativa",
    descricao: "Discussões sobre fantasia, mundos imaginários e sagas épicas.",
    participantes: ["Gustavo Alencar Lobato", "Rafael Lima", "Mariana Costa"],
    livros: ["nome-do-vento", "hobbit", "harry-potter"],
    publicacoes: [
      { autor: "Rafael Lima", texto: "Cheguei na metade de O Nome do Vento e a parte da Universidade é a melhor até agora." },
      { autor: "Mariana Costa", texto: "Leitura conjunta de outubro: O Hobbit. Três capítulos por semana, quem topa?" }
    ]
  },
  {
    id: "classicos", nome: "Leitores de Clássicos", membros: 860, status: "ativa",
    descricao: "Para quem ama literatura clássica brasileira e mundial.",
    participantes: ["Artur Barbosa Lobato", "João Victor Rios Ribeiro", "Ana Beatriz", "Camila Rocha"],
    livros: ["dom-casmurro"],
    publicacoes: [
      { autor: "Ana Beatriz", texto: "Reli Dom Casmurro depois de dez anos e mudei de opinião sobre o Bentinho." },
      { autor: "Camila Rocha", texto: "Qual clássico brasileiro vocês indicam para quem está começando?" }
    ]
  },
  {
    id: "ficcao-br", nome: "Ficção Científica BR", membros: 2015, status: "ativa",
    descricao: "Debates sobre ficção científica nacional e internacional.",
    participantes: ["Felipe Menezes Alho", "Lucas Almeida", "Mariana Costa"],
    livros: ["duna", "1984"],
    publicacoes: [
      { autor: "Lucas Almeida", texto: "Duna ou 1984 para começar no gênero? Estou montando uma lista para iniciantes." },
      { autor: "Mariana Costa", texto: "1984 continua atual demais. Terminei ontem e ainda estou pensando no final." }
    ]
  },
  {
    id: "suspense", nome: "Noites de Suspense", membros: 730, status: "indisponivel",
    descricao: "Thrillers, mistérios e romances policiais.",
    participantes: [], livros: [], publicacoes: []
  },
  {
    id: "poesia", nome: "Poesia de Bolso", membros: 312, status: "removida",
    descricao: "Um poema por dia para ler no caminho.",
    participantes: [], livros: [], publicacoes: []
  }
];

// ---- PBI-05: notificações que o usuário pode configurar ----
const LIMITE_NOTIFICACOES = 3;

const TIPOS_NOTIFICACAO = [
  { id: "lembrete", nome: "Lembrete diário de leitura" },
  { id: "comunidades", nome: "Novidades nas comunidades" },
  { id: "ranking", nome: "Mudanças no pódio" },
  { id: "amizades", nome: "Pedidos de amizade" },
  { id: "sugestoes", nome: "Sugestão de livro novo" }
];

// ---- Estado do usuário ----
const CHAVE_ESTADO = "letterbook_usuario";

// Conta de exemplo usada no primeiro acesso
function defaultState() {
  return {
    nome: "Nícola Gonçalves",
    bio: "Fã de fantasia e de clássicos brasileiros.",
    // livros do usuário; status: "lendo" ou "concluido" (só um livro fica como "lendo")
    livros: [
      { livroId: "nome-do-vento", status: "lendo", pagina: 214, inicio: "02/09/2026", fim: null },
      { livroId: "1984", status: "concluido", pagina: 416, inicio: "01/08/2026", fim: "20/08/2026" },
      { livroId: "dom-casmurro", status: "concluido", pagina: 256, inicio: "12/07/2026", fim: "30/07/2026" },
      { livroId: "harry-potter", status: "concluido", pagina: 264, inicio: "01/06/2026", fim: "12/06/2026" }
    ],
    tempoSeg: 148800, // tempo total de leitura já mensurado (41h 20min)
    sessaoInicio: null, // momento em que a sessão de leitura em andamento começou
    amizades: ["artur", "felipe", "gustavo", "joao"],
    notificacoes: ["lembrete", "comunidades"],
    avisos: [], // notificações recebidas
    avisosNovos: 0,
    confirmados: [] // PBI-06: cadastros já confirmados pelo moderador
  };
}

function loadState() {
  try {
    const salvo = localStorage.getItem(CHAVE_ESTADO);
    if (salvo !== null) return JSON.parse(salvo);
  } catch (erro) {
    // dado corrompido ou navegador sem localStorage: usa a conta de exemplo
  }
  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(state));
  } catch (erro) {
    // sem localStorage a plataforma continua funcionando, só não guarda os dados
  }
}
