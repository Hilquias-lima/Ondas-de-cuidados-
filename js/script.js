const raiz = document.documentElement;

/* ==========================================================
   Tema claro/escuro
   - O tema inicial é definido por um script no <head> (sem "flash").
   - Prioridade: escolha salva (localStorage "tema") > preferência do sistema.
   ========================================================== */
(function () {
    const CHAVE = "tema";
    const botaoTema = document.querySelector(".theme-toggle");
    const preferenciaEscura = window.matchMedia("(prefers-color-scheme: dark)");

    function lerSalvo() {
        try {
            const valor = localStorage.getItem(CHAVE);
            return valor === "dark" || valor === "light" ? valor : null;
        } catch (e) {
            return null;
        }
    }

    function temaAtual() {
        return raiz.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function aplicarTema(tema) {
        raiz.setAttribute("data-theme", tema);
        if (botaoTema) botaoTema.setAttribute("aria-pressed", String(tema === "dark"));
    }

    // Garantia caso o script do <head> não tenha rodado
    aplicarTema(raiz.hasAttribute("data-theme")
        ? temaAtual()
        : (lerSalvo() || (preferenciaEscura.matches ? "dark" : "light")));

    if (botaoTema) {
        botaoTema.addEventListener("click", () => {
            const proximo = temaAtual() === "dark" ? "light" : "dark";
            aplicarTema(proximo);
            try { localStorage.setItem(CHAVE, proximo); } catch (e) {}
        });
    }

    // Enquanto não houver escolha manual, acompanha o sistema operacional
    const aoMudarSistema = (evento) => {
        if (!lerSalvo()) aplicarTema(evento.matches ? "dark" : "light");
    };
    if (preferenciaEscura.addEventListener) {
        preferenciaEscura.addEventListener("change", aoMudarSistema);
    } else if (preferenciaEscura.addListener) {
        preferenciaEscura.addListener(aoMudarSistema);
    }
})();

/* ==========================================================
   Fundo animado pela rolagem (respeita "reduzir movimento")
   ========================================================== */
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

function animarFundo() {

    if (reduzirMovimento.matches) {
        raiz.style.setProperty("--fundo-scale", 1);
        raiz.style.setProperty("--fundo-y", "0px");
        return;
    }

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

/* ==========================================================
   Player "Respire. Desacelere. Escute."
   ========================================================== */
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

    function atualizarInterface() {
        iconePlay.style.display = estaTocando ? "none" : "block";
        iconePause.style.display = estaTocando ? "block" : "none";
        containerOnda.classList.toggle("tocando", estaTocando);
        btnPlay.setAttribute("aria-pressed", String(estaTocando));
        btnPlay.setAttribute(
            "aria-label",
            estaTocando ? "Pausar música tranquila" : "Reproduzir música tranquila"
        );
        statusAudio.textContent = estaTocando
            ? "Reproduzindo pausa sonora..."
            : "Artista · duração";
    }

    btnPlay.addEventListener("click", () => {
        estaTocando = !estaTocando;
        atualizarInterface();

        if (estaTocando) {
            if (audio && (audio.querySelector("source") || audio.src)) {
                audio.play().catch(() => {});
            }
        } else if (audio && !audio.paused) {
            audio.pause();
        }
    });

    // Ao terminar a faixa, o botão volta ao estado inicial
    if (audio) {
        audio.addEventListener("ended", () => {
            estaTocando = false;
            atualizarInterface();
        });
    }
});
