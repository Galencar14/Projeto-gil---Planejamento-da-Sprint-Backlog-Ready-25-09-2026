Objetivo: 
Elaborar um planejamento da sprint com o backlog preparado (ready) para o desenvolvimento de um Produto de Software escolhido na atividade anterior.
O que deve ser feito?
Planejamento da Sprint (Backlog Ready), utilizando a ferramenta Trello;
Responder questões da Sprint:

---

# LetterBook

Plataforma de leitura feita em HTML, CSS e JavaScript puro. Não precisa instalar nada: abra o `index.html` no navegador.

Os dados ficam salvos no próprio navegador (localStorage). No primeiro acesso a plataforma carrega uma conta de exemplo (Nícola Gonçalves, com os integrantes do grupo como amizades). Para voltar a ela a qualquer momento: **Perfil → Restaurar dados de exemplo**.

## Arquivos

- `index.html` e `pages/` — as páginas
- `css/style.css` — os estilos
- `js/dados.js` — livros, comunidades, leitores e a conta de exemplo
- `js/script.js` — as interações, separadas por PBI (cada uma com os comentários `SUCESSO` e `FALHA`)

## Backlog da Sprint — como testar cada critério de aceite

Quadro: https://trello.com/b/tzKh47hd/trello-eng-soft

| PBI | Onde | Sucesso | Falha |
|---|---|---|---|
| **PBI-01** Iniciar a sessão de leitura | Leitura | Clicar em **Iniciar sessão de leitura**: o cronômetro começa e a plataforma mensura o tempo e os livros lidos. | Com a sessão em andamento, clicar de novo em **Iniciar sessão de leitura**: aparece o erro e nenhuma nova medição é feita. |
| **PBI-02** Navegar pelas comunidades | Comunidades | Abrir **Clube do Livro Fantástico**: aparecem as publicações, os membros e os livros em discussão. | Abrir **Noites de Suspense** (indisponível) ou **Poesia de Bolso** (removida): aparece o erro e o conteúdo não é exibido. |
| **PBI-03** Abrir a aba Ranking | Ranking → **Progresso** | Clicar em **Progresso**: aparecem os livros lidos, o tempo de leitura, as páginas lidas e a comparação com os outros leitores. | Em Perfil, clicar em **Zerar dados de leitura** e voltar em Ranking → **Progresso**: o progresso não é mostrado, pois não há dados nem leitura iniciada. |
| **PBI-04** Contabilizar os livros concluídos | Ranking → **Pódio** | Clicar no filtro **Amizades**: o pódio é mostrado só entre as amizades. | Em Perfil, remover todas as amizades e clicar no filtro **Amizades**: o pódio não é mostrado. |
| **PBI-05** Receber sugestão de livro novo | Notificações (sino 🔔) | Marcar **Sugestão de livro novo**: a notificação é ativada e a primeira sugestão chega em "Notificações recebidas". | Marcar antes **Mudanças no pódio** (3 de 3 ativas) e depois **Sugestão de livro novo**: o sistema não permite configurar. |
| **PBI-06** Revisar informações cadastradas | Perfil → **Gerenciar livros (moderador)** | Clicar em **Revisar** no "Torto Arado" (cadastro concluído): todas as informações são exibidas e o botão **Confirmar livro** aparece. | Clicar em **Revisar** no "O Conto da Aia" (em cadastramento): o sistema informa que existem informações pendentes. |

## Itens que já estavam no quadro

| PBI | Onde | Sucesso | Falha |
|---|---|---|---|
| **PBI-07** Informar a página atual | Leitura | Digitar uma página válida e clicar em **Salvar página**. | Deixar o campo vazio ou digitar uma página fora do livro. |
| **PBI-08** Registrar o livro no histórico | Leitura | Clicar em **Marcar como concluído** e confirmar: o progresso vai para 100%. | Cancelar a confirmação, ou clicar de novo sem ter livro em leitura. |
| **PBI-09** Exibir lojas que vendem o livro | Lojas | — | — |
| **PBI-10** Acessar o perfil do usuário | Ícone com as iniciais, no topo | — | — |
