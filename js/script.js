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

document.addEventListener("DOMContentLoaded", () => {
    const containerOnda = document.getElementById("onda-sonora");
    const btnPlay = document.getElementById("btn-play");
    const iconePlay = document.getElementById("icone-play");
    const iconePause = document.getElementById("icone-pause");
    const statusAudio = document.getElementById("status-audio");
    const audio = document.getElementById("audio-relaxante");

    if (!containerOnda || !btnPlay) return;

    const alturasBarras = [
        24, 48, 86, 100, 74, 44, 62, 78, 52, 34, 
        48, 72, 92, 64, 88, 56, 70, 50, 40, 62, 
        84, 58, 96, 66, 48, 76, 54, 42, 26
    ];

    alturasBarras.forEach((altura, index) => {
        const barra = document.createElement("span");
        barra.classList.add("barra-onda");
        barra.style.height = `${altura}px`;
        barra.style.animationDelay = `${(index % 7) * 0.12}s`;
        containerOnda.appendChild(barra);
    });

    let estaTocando = false;

    btnPlay.addEventListener("click", () => {
        estaTocando = !estaTocando;

        if (estaTocando) {
            iconePlay.style.display = "none";
            iconePause.style.display = "block";
            containerOnda.classList.add("tocando");
            statusAudio.textContent = "Reproduzindo pausa sonora...";

            if (audio && (audio.querySelector("source") || audio.src)) {
                audio.play().catch(() => {});
            }
        } else {
            iconePlay.style.display = "block";
            iconePause.style.display = "none";
            containerOnda.classList.remove("tocando");
            statusAudio.textContent = "Artista · duração";

            if (audio && !audio.paused) {
                audio.pause();
            }
        }
    });
});

btnPlay.addEventListener("click", () => {
    estaTocando = !estaTocando;

    if (estaTocando) {
        iconePlay.style.display = "none";
        iconePause.style.display = "block";
        containerOnda.classList.add("tocando");
        statusAudio.textContent = "Reproduzindo pausa sonora...";

        if (audio) {
            audio.play().catch((erro) => {
                console.log("Erro ao reproduzir áudio: ", erro);
            });
        }
    } else {
        iconePlay.style.display = "block";
        iconePause.style.display = "none";
        containerOnda.classList.remove("tocando");
        statusAudio.textContent = "Artista · duração";

        if (audio) {
            audio.pause();
        }
    }
});