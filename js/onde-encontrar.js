document.addEventListener("DOMContentLoaded", () => {
    const clinicas = [
        {
            nome: "Espaço Harmonia & Escuta",
            bairro: "Manaíra",
            cidade: "João Pessoa",
            uf: "PB",
            cep: "58038-000",
            endereco: "Av. Governador Flávio Ribeiro Coutinho, 420",
            modalidade: "Presencial",
            lat: -7.1045,
            lng: -34.8356,
            descricao: "Atendimento individual e em grupo com foco em regulação emocional e qualidade de vida.",
            contato: "(83) 99999-1001"
        },
        {
            nome: "Clínica Som & Desenvolvimento",
            bairro: "Mangabeira",
            cidade: "João Pessoa",
            uf: "PB",
            cep: "58055-000",
            endereco: "Rua Josefa Taveira, 815",
            modalidade: "Infantil",
            lat: -7.1695,
            lng: -34.8412,
            descricao: "Sessões de musicoterapia infantil, comunicação e acompanhamento multidisciplinar.",
            contato: "(83) 99999-1002"
        },
        {
            nome: "Ressonância Cuidado Integrado",
            bairro: "Centro",
            cidade: "João Pessoa",
            uf: "PB",
            cep: "58013-000",
            endereco: "Rua Duque de Caxias, 210",
            modalidade: "Presencial",
            lat: -7.1195,
            lng: -34.8829,
            descricao: "Acolhimento terapêutico voltado ao alívio do estresse e bem-estar cotidiano.",
            contato: "(83) 99999-1003"
        },
        {
            nome: "Instituto Canto Sereno",
            bairro: "Bancários",
            cidade: "João Pessoa",
            uf: "PB",
            cep: "58051-000",
            endereco: "Rua Empresário João Rodrigues Alves, 150",
            modalidade: "Presencial",
            lat: -7.1452,
            lng: -34.8445,
            descricao: "Práticas musicais terapêuticas para adultos, idosos e reabilitação cognitiva.",
            contato: "(83) 99999-1005"
        },
        {
            nome: "Ondas Terapia Sonora Online",
            bairro: "Atendimento Remoto",
            cidade: "Todo o Brasil",
            uf: "BR",
            cep: "",
            endereco: "Sessões por videochamada (sem deslocamento)",
            modalidade: "Online",
            lat: null,
            lng: null,
            descricao: "Acompanhamento remoto para quem busca flexibilidade ou não tem clínica física por perto.",
            contato: "(83) 99999-1004"
        }
    ];

    const formBusca = document.getElementById("formBuscaClinicas");
    const inputEndereco = document.getElementById("inputEnderecoOE");
    const btnBuscar = document.getElementById("btnBuscarClinicas");
    const btnLimpar = document.getElementById("btnLimparBusca");
    const chipsFiltro = document.querySelectorAll(".chipFiltroOE");
    const gradeClinicas = document.getElementById("gradeClinicas");
    const statusBusca = document.getElementById("statusBuscaClinicas");
    const estadoVazio = document.getElementById("estadoVazioClinicas");
    const textoVazioDetalhes = document.getElementById("textoVazioDetalhes");
    const btnVerOnline = document.getElementById("btnVerOnline");
    const btnMostrarTodas = document.getElementById("btnMostrarTodas");

    let filtroAtivo = "todas";

    // Formata o CEP automaticamente enquanto o usuário digita
    inputEndereco.addEventListener("input", () => {
        const apenasNumeros = inputEndereco.value.replace(/\D/g, "");
        if (apenasNumeros.length > 0 && /^[\d\s-]+$/.test(inputEndereco.value)) {
            const oito = apenasNumeros.slice(0, 8);
            inputEndereco.value = oito.length > 5 ? `${oito.slice(0, 5)}-${oito.slice(5)}` : oito;
        }
    });

    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function atualizarChips(novoFiltro) {
        filtroAtivo = novoFiltro;
        chipsFiltro.forEach((chip) => {
            chip.classList.toggle("ativo", chip.dataset.filtro === filtroAtivo);
        });
    }

    // Consulta ViaCEP com timeout para nunca ficar travado
    async function consultarViaCep(cepLimpo) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);

        try {
            const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
                signal: controller.signal
            });
            if (!resp.ok) return null;
            const data = await resp.json();
            return data.erro ? null : data;
        } catch {
            return null;
        } finally {
            clearTimeout(timer);
        }
    }

    // Busca coordenadas aproximadas do endereço/CEP via Nominatim (OpenStreetMap)
    async function obterCoordenadasOrigem(consulta) {
        if (!consulta) return null;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(consulta)}`;
            const resp = await fetch(url, {
                signal: controller.signal,
                headers: { "Accept": "application/json" }
            });
            if (!resp.ok) return null;
            const lista = await resp.json();
            if (!Array.isArray(lista) || lista.length === 0) return null;
            return {
                lat: parseFloat(lista[0].lat),
                lng: parseFloat(lista[0].lon)
            };
        } catch {
            return null;
        } finally {
            clearTimeout(timer);
        }
    }

    // Distância em linha reta (Haversine) em km
    function distanciaKm(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function formatarMinutos(minutos) {
        const total = Math.max(1, Math.round(minutos));
        if (total < 60) return `~${total} min`;
        const horas = Math.floor(total / 60);
        const resto = total % 60;
        return resto > 0 ? `~${horas}h ${resto}min` : `~${horas}h`;
    }

    // Estima tempo de carro e de ônibus a partir da origem até a clínica
    function calcularEstimativas(clinica, coordsOrigem) {
        if (clinica.modalidade === "Online" || clinica.lat === null || clinica.lng === null) {
            return "Atendimento online — sem deslocamento";
        }

        if (!coordsOrigem || Number.isNaN(coordsOrigem.lat) || Number.isNaN(coordsOrigem.lng)) {
            return "Digite um CEP ou endereço para estimar carro e ônibus";
        }

        const kmLinhaReta = distanciaKm(
            coordsOrigem.lat,
            coordsOrigem.lng,
            clinica.lat,
            clinica.lng
        );

        // Fator urbano (~1.25x a distância em linha reta)
        const kmUrbano = kmLinhaReta * 1.25;

        // Velocidades médias urbanas estimadas: carro ~28 km/h, ônibus ~18 km/h + ~6 min de espera/caminhada
        const minCarro = (kmUrbano / 28) * 60;
        const minOnibus = (kmUrbano / 18) * 60 + 6;

        return `🚗 ${formatarMinutos(minCarro)} de carro · 🚌 ${formatarMinutos(minOnibus)} de ônibus (${kmUrbano.toFixed(1)} km)`;
    }

    function filtrarClinicas({ termo = "", dadosCep = null }) {
        return clinicas.filter((clinica) => {
            const bateModalidade =
                filtroAtivo === "todas" || clinica.modalidade === filtroAtivo;
            if (!bateModalidade) return false;

            if (dadosCep) {
                const mesmaCidade =
                    normalizarTexto(clinica.cidade) === normalizarTexto(dadosCep.localidade);
                const mesmoBairro =
                    dadosCep.bairro &&
                    normalizarTexto(clinica.bairro) === normalizarTexto(dadosCep.bairro);
                const mesmoPrefixo =
                    clinica.cep &&
                    clinica.cep.replace(/\D/g, "").slice(0, 4) ===
                        dadosCep.cep.replace(/\D/g, "").slice(0, 4);

                return mesmaCidade || mesmoBairro || mesmoPrefixo;
            }

            const termoNorm = normalizarTexto(termo);
            if (!termoNorm) return true;

            const textoClinica = normalizarTexto(
                `${clinica.nome} ${clinica.bairro} ${clinica.cidade} ${clinica.uf} ${clinica.endereco} ${clinica.cep} ${clinica.modalidade}`
            );
            return textoClinica.includes(termoNorm);
        });
    }

    function montarLinkRota(clinica, origemTexto) {
        const destino = encodeURIComponent(
            `${clinica.endereco}, ${clinica.bairro}, ${clinica.cidade} - ${clinica.uf}`
        );

        if (origemTexto && clinica.modalidade !== "Online") {
            const origem = encodeURIComponent(origemTexto);
            return `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`;
        }

        return `https://www.google.com/maps/search/?api=1&query=${destino}`;
    }

    function renderizarResultados(lista, mensagemStatus, origemTexto = "", coordsOrigem = null, localVazio = "") {
        gradeClinicas.innerHTML = "";
        statusBusca.textContent = mensagemStatus;

        if (lista.length === 0) {
            estadoVazio.hidden = false;
            textoVazioDetalhes.textContent = localVazio
                ? `Poxa, ainda não temos clínicas presenciais cadastradas em ${localVazio}. Mas você não precisa ficar sem cuidado: que tal conhecer nosso atendimento online ou ver todas as unidades disponíveis?`
                : "Poxa, ainda não temos clínicas cadastradas para essa busca. Que tal ver o atendimento online ou conferir todas as clínicas disponíveis?";
            return;
        }

        estadoVazio.hidden = true;

        lista.forEach((clinica) => {
            const card = document.createElement("article");
            card.className = "cardClinicaOE";

            const enderecoFormatado =
                clinica.modalidade === "Online"
                    ? clinica.endereco
                    : `${clinica.endereco} — ${clinica.bairro}, ${clinica.cidade}/${clinica.uf}${clinica.cep ? ` · CEP ${clinica.cep}` : ""}`;

            const estimativaTexto = calcularEstimativas(clinica, coordsOrigem);
            const urlRota = montarLinkRota(clinica, origemTexto);
            const rotuloLink =
                clinica.modalidade === "Online"
                    ? "Saiba mais"
                    : origemTexto
                      ? "Ver rota até o local"
                      : "Ver no mapa";

            card.innerHTML = `
                <div>
                    <div class="cardTopoOE">
                        <h3 class="cardNomeOE">${clinica.nome}</h3>
                        <span class="badgeModalidadeOE">${clinica.modalidade}</span>
                    </div>
                </div>

                <div class="enderecoCompletoOE">
                    <strong>Endereço:</strong> ${enderecoFormatado}
                </div>

                <p class="cardDescricaoOE">${clinica.descricao}</p>

                <div class="temposRotaOE">
                    <span>${estimativaTexto}</span>
                </div>

                <div class="cardRodapeOE">
                    <span>${clinica.contato}</span>
                    <a
                        class="linkMapaOE"
                        href="${urlRota}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${rotuloLink}
                    </a>
                </div>
            `;

            gradeClinicas.appendChild(card);
        });
    }

    async function executarBusca() {
        const entrada = inputEndereco.value.trim();
        const digitos = entrada.replace(/\D/g, "");
        const temApenasCaracteresDeCep = /^[\d\s-]+$/.test(entrada);

        // Se digitou um CEP incompleto (ex.: 58038 com menos de 8 dígitos)
        if (entrada && temApenasCaracteresDeCep && digitos.length !== 8) {
            renderizarResultados(
                [],
                `Digite um CEP válido com 8 números (ex.: 58038-000) ou pesquise por bairro/cidade.`,
                "",
                null,
                `CEP "${entrada}"`
            );
            return;
        }

        btnBuscar.disabled = true;
        btnBuscar.textContent = "Buscando...";

        try {
            if (digitos.length === 8 && temApenasCaracteresDeCep) {
                statusBusca.textContent = "Consultando CEP e calculando rotas...";
                const dadosCep = await consultarViaCep(digitos);

                const enderecoOrigem = dadosCep
                    ? [dadosCep.logradouro, dadosCep.bairro, `${dadosCep.localidade} - ${dadosCep.uf}`, `CEP ${dadosCep.cep}`]
                          .filter(Boolean)
                          .join(", ")
                    : `CEP ${entrada}, Brasil`;

                const localResumo = dadosCep
                    ? [dadosCep.bairro, `${dadosCep.localidade} - ${dadosCep.uf}`].filter(Boolean).join(", ")
                    : `CEP ${entrada}`;

                const coordsOrigem = await obterCoordenadasOrigem(
                    dadosCep ? `${dadosCep.bairro || ""} ${dadosCep.localidade} ${dadosCep.uf} ${dadosCep.cep}` : `${entrada} Brasil`
                );

                const encontrados = filtrarClinicas({ dadosCep });

                if (coordsOrigem) {
                    encontrados.sort((a, b) => {
                        if (a.lat === null) return 1;
                        if (b.lat === null) return -1;
                        return (
                            distanciaKm(coordsOrigem.lat, coordsOrigem.lng, a.lat, a.lng) -
                            distanciaKm(coordsOrigem.lat, coordsOrigem.lng, b.lat, b.lng)
                        );
                    });
                }

                const msg = encontrados.length
                    ? `CEP ${entrada} (${localResumo}): ${encontrados.length} opção(ões) encontrada(s).`
                    : `CEP ${entrada} (${localResumo}): nenhuma clínica presencial cadastrada nessa região.`;

                renderizarResultados(encontrados, msg, enderecoOrigem, coordsOrigem, localResumo);
                return;
            }

            // Busca por bairro, rua ou cidade
            const coordsOrigem = entrada
                ? await obterCoordenadasOrigem(`${entrada}, Paraíba, Brasil`)
                : null;

            const encontrados = filtrarClinicas({ termo: entrada });

            if (coordsOrigem) {
                encontrados.sort((a, b) => {
                    if (a.lat === null) return 1;
                    if (b.lat === null) return -1;
                    return (
                        distanciaKm(coordsOrigem.lat, coordsOrigem.lng, a.lat, a.lng) -
                        distanciaKm(coordsOrigem.lat, coordsOrigem.lng, b.lat, b.lng)
                    );
                });
            }

            const msg = entrada
                ? encontrados.length
                    ? `Encontramos ${encontrados.length} opção(ões) para "${entrada}".`
                    : `Nenhuma clínica encontrada para "${entrada}".`
                : `Exibindo ${encontrados.length} opção(ões) disponíveis (${filtroAtivo === "todas" ? "todas as modalidades" : filtroAtivo}).`;

            renderizarResultados(encontrados, msg, entrada, coordsOrigem, entrada);
        } finally {
            btnBuscar.disabled = false;
            btnBuscar.textContent = "Buscar clínicas";
        }
    }

    formBusca.addEventListener("submit", (e) => {
        e.preventDefault();
        executarBusca();
    });

    btnLimpar.addEventListener("click", () => {
        inputEndereco.value = "";
        atualizarChips("todas");
        executarBusca();
    });

    chipsFiltro.forEach((chip) => {
        chip.addEventListener("click", () => {
            atualizarChips(chip.dataset.filtro);
            executarBusca();
        });
    });

    btnVerOnline.addEventListener("click", () => {
        inputEndereco.value = "";
        atualizarChips("Online");
        executarBusca();
    });

    btnMostrarTodas.addEventListener("click", () => {
        inputEndereco.value = "";
        atualizarChips("todas");
        executarBusca();
    });

    executarBusca();
});