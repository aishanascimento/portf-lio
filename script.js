document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.querySelector("#tema");
    if (btnTema) {
        btnTema.addEventListener("click", () => {
            const ehEscuro = document.body.classList.toggle("escuro");
            btnTema.setAttribute("aria-pressed", String(ehEscuro));
        });
    }

    const formCadastro = document.querySelector("#cadastro");
    const listaProjetos = document.querySelector("#lista-projetos");
    const filtroProjetos = document.querySelector("#filtro");
    const statusGeral = document.querySelector("#status");
    const contadorProjetos = document.querySelector("#contador");

    function mostrarStatusGeral(mensagem, tipo) {
        if (!statusGeral) return;
        statusGeral.textContent = mensagem;
        statusGeral.dataset.tipo = tipo;
    }

    function aplicarFiltro() {
        if (!listaProjetos || !filtroProjetos) return;
        const valorFiltro = filtroProjetos.value.toLowerCase();
        const cards = listaProjetos.querySelectorAll(".projeto");
        let visiveis = 0;

        cards.forEach((card) => {
            const categoriaCard = (card.dataset.categoria || "").toLowerCase();
            if (valorFiltro === "todos" || categoriaCard === valorFiltro) {
                card.classList.remove("oculto");
                visiveis++;
            } else {
                card.classList.add("oculto");
            }
        });

        if (contadorProjetos) {
            contadorProjetos.textContent = visiveis === 0
                ? "Nenhum projeto nesta categoria."
                : `Exibindo ${visiveis} de ${cards.length} projeto(s).`;
        }
    }

    if (formCadastro) {
        formCadastro.addEventListener("submit", (evento) => {
            evento.preventDefault();
            if (!formCadastro.checkValidity()) {
                formCadastro.reportValidity();
                return;
            }

            const dados = new FormData(formCadastro);
            const titulo = dados.get("titulo").trim();
            const categoria = dados.get("categoria");

            if (titulo.length < 3) return;

            const card = document.createElement("article");
            card.className = "card projeto";
            card.dataset.categoria = categoria;

            const h3 = document.createElement("h3");
            h3.textContent = titulo;

            const catTexto = document.createElement("p");
            catTexto.className = "tecnologias";
            catTexto.textContent = `Categoria: ${categoria.toUpperCase()}`;

            const botaoRemover = document.createElement("button");
            botaoRemover.className = "remover";
            botaoRemover.type = "button";
            botaoRemover.textContent = "Remover";

            card.append(h3, catTexto, botaoRemover);
            listaProjetos.appendChild(card);

            formCadastro.reset();
            aplicarFiltro();
            mostrarStatusGeral(`Projeto "${titulo}" adicionado!`, "sucesso");
        });
    }

    if (filtroProjetos) {
        filtroProjetos.addEventListener("change", aplicarFiltro);
    }

    if (listaProjetos) {
        listaProjetos.addEventListener("click", (evento) => {
            const botao = evento.target.closest(".remover");
            if (!botao || !listaProjetos.contains(botao)) return;

            const card = botao.closest(".projeto");
            if (card) {
                const tituloCard = card.querySelector("h3") ? card.querySelector("h3").textContent : "";
                card.remove();
                aplicarFiltro();
                mostrarStatusGeral(`Projeto "${tituloCard}" removido.`, "sucesso");
            }
        });
    }

    aplicarFiltro();

    const formContato = document.querySelector("#form-contato");
    if (!formContato) return;

    const campoNome = document.querySelector("#contato-nome");
    const campoEmail = document.querySelector("#contato-email");
    const campoMotivo = document.querySelector("#contato-motivo");
    const containerAssunto = document.querySelector("#container-assunto");
    const campoAssunto = document.querySelector("#contato-assunto");
    const campoMensagem = document.querySelector("#contato-mensagem");
    const contadorMensagem = document.querySelector("#contador-mensagem");
    const resumoErros = document.querySelector("#resumo-erros");
    const statusContato = document.querySelector("#contato-status");
    const btnEnviarContato = document.querySelector("#btn-enviar-contato");
    const chkSimularFalha = document.querySelector("#simular-falha");

    let formEnviadoUmaVez = false;
    let emProcessamento = false;

    function obterTamanhoNormalizado(valor) {
        return (valor || "").trim().length;
    }

    function atualizarContadorMensagem() {
        if (!campoMensagem || !contadorMensagem) return;
        const tamanho = obterTamanhoNormalizado(campoMensagem.value);
        contadorMensagem.textContent = `${tamanho} / 1000 caracteres`;

        if (tamanho > 1000 || (tamanho > 0 && tamanho < 30)) {
            contadorMensagem.classList.add("limite-atingido");
        } else {
            contadorMensagem.classList.remove("limite-atingido");
        }
    }

    if (campoMensagem) {
        campoMensagem.addEventListener("input", () => {
            atualizarContadorMensagem();
            if (formEnviadoUmaVez) validarCampo(campoMensagem);
        });
    }

    function atualizarRegraCondicional() {
        if (!campoMotivo || !containerAssunto || !campoAssunto) return;
        const ehOutro = campoMotivo.value === "Outro";
        containerAssunto.hidden = !ehOutro;

        if (ehOutro) {
            campoAssunto.setAttribute("required", "true");
        } else {
            campoAssunto.removeAttribute("required");
            limparErroCampo(campoAssunto);
            campoAssunto.value = "";
        }
    }

    if (campoMotivo) {
        campoMotivo.addEventListener("change", () => {
            atualizarRegraCondicional();
            if (formEnviadoUmaVez) validarCampo(campoMotivo);
        });
    }

    function validarCampo(campo) {
        if (!campo) return true;

        if (campo === campoAssunto && containerAssunto.hidden) {
            limparErroCampo(campo);
            return true;
        }

        const id = campo.id;
        const valor = campo.value;
        const tam = obterTamanhoNormalizado(valor);
        let mensagemErro = "";

        if (id === "contato-nome") {
            if (tam === 0) {
                mensagemErro = "O nome é obrigatório.";
            } else if (tam < 3 || tam > 80) {
                mensagemErro = "O nome deve ter entre 3 e 80 caracteres.";
            }
        } else if (id === "contato-email") {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (tam === 0) {
                mensagemErro = "O e-mail é obrigatório.";
            } else if (!regexEmail.test(valor.trim())) {
                mensagemErro = "Informe um e-mail válido.";
            }
        } else if (id === "contato-motivo") {
            if (!valor) {
                mensagemErro = "Selecione o motivo do contato.";
            }
        } else if (id === "contato-assunto") {
            if (campoMotivo.value === "Outro") {
                if (tam === 0) {
                    mensagemErro = "O assunto é obrigatório para a opção 'Outro'.";
                } else if (tam < 5 || tam > 100) {
                    mensagemErro = "O assunto deve ter entre 5 e 100 caracteres.";
                }
            }
        } else if (id === "contato-mensagem") {
            if (tam === 0) {
                mensagemErro = "A mensagem é obrigatória.";
            } else if (tam < 30 || tam > 1000) {
                mensagemErro = `A mensagem deve ter entre 30 e 1000 caracteres. (Atual: ${tam})`;
            }
        }

        if (mensagemErro) {
            aplicarErroCampo(campo, mensagemErro);
            return false;
        } else {
            limparErroCampo(campo);
            return true;
        }
    }

    function aplicarErroCampo(campo, texto) {
        campo.setAttribute("aria-invalid", "true");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = texto;
    }

    function limparErroCampo(campo) {
        campo.removeAttribute("aria-invalid");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = "";
    }

    [campoNome, campoEmail, campoAssunto].forEach((campo) => {
        if (!campo) return;
        campo.addEventListener("input", () => {
            if (formEnviadoUmaVez) validarCampo(campo);
        });
        campo.addEventListener("blur", () => {
            if (formEnviadoUmaVez || campo.value.trim() !== "") validarCampo(campo);
        });
    });

    formContato.addEventListener("submit", async (e) => {
        e.preventDefault();
        formEnviadoUmaVez = true;

        if (emProcessamento) return;

        const campos = [campoNome, campoEmail, campoMotivo, campoAssunto, campoMensagem];
        const invalidos = [];

        campos.forEach((campo) => {
            if (!validarCampo(campo)) {
                invalidos.push(campo);
            }
        });

        if (invalidos.length > 0) {
            exibirResumoErros(invalidos);
            invalidos[0].focus();
            return;
        }

        if (resumoErros) resumoErros.hidden = true;
        iniciarEstadoProcessamento(true);

        const dadosForm = new FormData(formContato);

        try {
            if (chkSimularFalha && chkSimularFalha.checked) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                throw new Error("Falha simulada no envio para teste de resiliência.");
            }

            const resposta = await fetch(formContato.action, {
                method: "POST",
                body: dadosForm,
                headers: { 'Accept': 'application/json' }
            });

            if (resposta.ok) {
                exibirStatusContato("Mensagem enviada com sucesso! Em breve entrarei em contato.", "sucesso");
                formContato.reset();
                atualizarRegraCondicional();
                atualizarContadorMensagem();
                formEnviadoUmaVez = false;
            } else {
                const dadosResposta = await resposta.json().catch(() => ({}));
                let msgErro = "Não foi possível realizar o envio.";

                if (resposta.status === 404) {
                    msgErro = "Formulário não encontrado. Insira o código do Formspree no atributo 'action' do HTML.";
                } else if (dadosResposta.errors && dadosResposta.errors.length > 0) {
                    msgErro = dadosResposta.errors.map(err => err.message).join(", ");
                }

                throw new Error(msgErro);
            }
        } catch (erro) {
            exibirStatusContato(`Falha no envio: ${erro.message} (Seus dados foram preservados).`, "erro");
        } finally {
            iniciarEstadoProcessamento(false);
        }
    });

    function iniciarEstadoProcessamento(processando) {
        emProcessamento = processando;
        if (btnEnviarContato) {
            btnEnviarContato.disabled = processando;
            btnEnviarContato.textContent = processando ? "Enviando mensagem..." : "Enviar mensagem";
        }

        if (processando) {
            exibirStatusContato("Processando envio da mensagem, aguarde...", "processando");
        }
    }

    function exibirStatusContato(mensagem, tipo) {
        if (!statusContato) return;
        statusContato.textContent = mensagem;
        statusContato.dataset.tipo = tipo;
    }

    function exibirResumoErros(listaCamposInvalidos) {
        if (!resumoErros) return;
        resumoErros.innerHTML = "";
        resumoErros.hidden = false;

        const titulo = document.createElement("h4");
        titulo.textContent = "Por favor, corrija os erros abaixo antes de enviar:";

        const lista = document.createElement("ul");
        listaCamposInvalidos.forEach((campo) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `#${campo.id}`;

            const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
            link.textContent = spanErro ? spanErro.textContent : `Verifique o campo ${campo.name}`;

            link.addEventListener("click", (e) => {
                e.preventDefault();
                campo.focus();
            });

            item.appendChild(link);
            lista.appendChild(item);
        });

        resumoErros.append(titulo, lista);
        resumoErros.focus();
    }

    atualizarRegraCondicional();
    atualizarContadorMensagem();
});