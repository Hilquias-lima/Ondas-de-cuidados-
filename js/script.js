const raiz = document.documentElement;

function animarFundo() {

    const alturaRolagem =
        document.documentElement.scrollHeight - window.innerHeight;

    const posicaoAtual = window.scrollY;

    const progresso = alturaRolagem > 0
        ? Math.min(posicaoAtual / alturaRolagem, 1)
        : 0;

    const escala = 1 + (progresso * 0.25);

    const deslocamento = progresso * -50;

    raiz.style.setProperty("--fundo-scale", escala);
    raiz.style.setProperty("--fundo-y", `${deslocamento}px`);
}

window.addEventListener("scroll", animarFundo);

animarFundo();