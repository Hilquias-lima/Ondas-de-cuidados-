// Seleciona o elemento principal da página
const raiz = document.documentElement;

// Atualiza a transformação do fundo conforme a rolagem
function animarFundo() {

    // Altura total que pode ser percorrida
    const alturaRolagem =
        document.documentElement.scrollHeight - window.innerHeight;

    // Posição atual da rolagem
    const posicaoAtual = window.scrollY;

    // Calcula o progresso entre 0 e 1
    const progresso = alturaRolagem > 0
        ? Math.min(posicaoAtual / alturaRolagem, 1)
        : 0;

    // Calcula o aumento da imagem
    const escala = 1 + (progresso * 0.25);

    // Calcula o deslocamento vertical
    const deslocamento = progresso * -50;

    // Aplica os valores ao CSS
    raiz.style.setProperty("--fundo-scale", escala);
    raiz.style.setProperty("--fundo-y", `${deslocamento}px`);
}

// Executa quando a página é rolada
window.addEventListener("scroll", animarFundo);

// Executa ao carregar a página
animarFundo();