# Lightbot Clone - Trabalho Prático DCC202

Este projeto é uma implementação de um jogo de lógica inspirado no Lightbot, desenvolvido como trabalho prático da disciplina de Desenvolvimento Web (DCC202).

O objetivo do jogo é programar os movimentos de um robô para que ele acenda todas as luzes azuis do mapa. O projeto foi construído utilizando apenas HTML, CSS e JavaScript puros, sem frameworks ou bibliotecas externas.

## Funcionalidades

- Visualização do tabuleiro e execução dos comandos em tempo real.
- Mecânica de procedimentos (Main, P1 e P2) para reutilização de código e recursividade.
- Modo "Passo a Passo" para depuração da lógica.
- Comandos de movimentação básica, pulo (avança duas casas) e interação com luzes.
- Interface com tema escuro e feedback visual nos botões.
- Sistema de verificação de vitória e transição de fases.
- 4 Níveis com dificuldade progressiva (mapas até 10x10).

## Como rodar o projeto

Você pode acessar o jogo diretamente pelo GitHub Pages ([link na descrição do repositório](https://ufjf-dcc202.github.io/ufjf-dcc202-2025-3-b-trb-jorge-e-yury/)) ou rodar localmente:

1. Clone este repositório.
2. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge).
3. Não é necessário instalar dependências ou usar servidores backend.

## Controles

O jogo é controlado através da interface visual:

- **Setas/Ícones:** Adicionam comandos à fila do processador ativo.
- **Executar:** Roda o programa completo.
- **Passo:** Executa uma instrução por vez (útil para encontrar erros).
- **P1 / P2:** Chamam as funções auxiliares.
- **Pular:** O robô avança duas casas na direção atual, podendo passar por cima de buracos.

## Autores

Trabalho desenvolvido pela dupla:

* Jorge [Sobrenome] - Matrícula: 202265055C
* Yury [Sobrenome] - Matrícula: 202565200A
