/*
  FORNO CHEIO 2027 | SCRIPT DA PÁGINA DE VENDAS

  CONFIGURAÇÃO (é só mexer aqui em cima)

  1. Cole os links de checkout de cada versão.
     - Cada versão tem três espaços (a, b e c) para o teste de order bumps.
     - Se for usar um checkout só, cole o link no "a" e deixe "b" e "c" como estão.
     - Enquanto nenhum link for colado, os botões levam para a seção das versões.

  2. O bônus "Natal 2026 Expresso" sai da página sozinho na data de "fimDoBonusDeNatal"
     (meia-noite de 1º de janeiro de 2027, horário de Brasília).
     Lembre de tirar esse bônus também da entrega na plataforma.

  3. Para testar um checkout específico, abra a página com ?ck=a, ?ck=b ou ?ck=c no fim do endereço.

  4. DEPOIMENTOS (prints de WhatsApp):
     - Enquanto a lista DEPOIMENTOS estiver vazia, a seção mostra três caixas em branco.
     - Salve cada print na pasta img/depoimentos/ (de preferência em .jpg, com até 900 px de largura)
       e coloque cada um na lista DEPOIMENTOS, logo abaixo do CONFIG. As caixas em branco somem sozinhas.
     - Use só prints reais, com autorização da confeiteira. Se ela preferir, apague o nome e a foto no print.

  5. FAIXA DE LANÇAMENTO: a faixa vermelha do topo diz até quando vale o preço de lançamento.
     A data fica em "fim" (formato ano-mês-dia, horário de Brasília). O texto muda sozinho:
       - até a véspera: "Preço de lançamento só até quarta, 18/11. Depois, o preço sobe."
       - na véspera:    "Preço de lançamento termina amanhã, 18/11..."
       - no dia:        "Último dia do preço de lançamento: termina hoje às 23h59."
       - depois do prazo, a faixa some sozinha.
     IMPORTANTE: no dia seguinte ao prazo, suba o preço na Cakto e na página (CONFIG.precos e os
     cartões de preço no index.html). A faixa só promete o que você vai cumprir.
     Para tirar a faixa antes, mude "ativo" para false.

*/
var CONFIG = {
  checkouts: {
    ebook: {
      a: "https://pay.cakto.com.br/ip6d3vv",
      b: "COLE_AQUI_O_LINK_DO_CHECKOUT_EBOOK_B",
      c: "COLE_AQUI_O_LINK_DO_CHECKOUT_EBOOK_C"
    },
    completo: {
      a: "https://pay.cakto.com.br/ycfavx3_1169287",
      b: "COLE_AQUI_O_LINK_DO_CHECKOUT_COMPLETO_B",
      c: "COLE_AQUI_O_LINK_DO_CHECKOUT_COMPLETO_C"
    }
  },
  precos: { ebook: 10.00, completo: 27.90 },
  nomes: { ebook: "Forno Cheio 2027 - só o e-book", completo: "Forno Cheio 2027 - versão completa" },
  fimDoBonusDeNatal: "2027-01-01T00:00:00-03:00",
  lancamento: {
    ativo: true,
    fim: "2026-11-18T23:59:59-03:00"
  }
};

/*
  Cada depoimento tem:
  - imagem:  o caminho do print, por exemplo "img/depoimentos/ana.jpg";
  - nome:    o primeiro nome dela (aparece embaixo do print);
  - detalhe: o que ela vende e a cidade, por exemplo "bolos em Goiânia" (opcional);
  - texto:   opcional. Se não tiver print, escreva aqui a mensagem dela e ela aparece num balão.

  Exemplo (copie a linha, tire as duas barras // do começo e troque os dados):
  // { imagem: "img/depoimentos/ana.jpg", nome: "Ana", detalhe: "bolos em Goiânia" },
*/
var DEPOIMENTOS = [

];


(function () {
  var raiz = document.documentElement;

  /* Faixa de lançamento */
  var faixa = document.getElementById("faixa-prazo");
  if (faixa) {
    var fimLancamento = CONFIG.lancamento ? Date.parse(CONFIG.lancamento.fim) : NaN;
    var agoraFaixa = Date.now();
    if (!CONFIG.lancamento || !CONFIG.lancamento.ativo || isNaN(fimLancamento) || agoraFaixa > fimLancamento) {
      faixa.hidden = true;
    } else {
      /* conta os dias pelo horário de Brasília */
      var BRASILIA = -3 * 60 * 60 * 1000;
      var diaBR = function (ms) { var d = new Date(ms + BRASILIA); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
      var faltam = Math.round((diaBR(fimLancamento) - diaBR(agoraFaixa)) / 86400000);
      var dFim = new Date(fimLancamento + BRASILIA);
      var semana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][dFim.getUTCDay()];
      var dataCurta = ("0" + dFim.getUTCDate()).slice(-2) + "/" + ("0" + (dFim.getUTCMonth() + 1)).slice(-2);
      var textoFaixa = document.getElementById("faixa-texto");
      if (textoFaixa) {
        if (faltam <= 0) {
          textoFaixa.innerHTML = "<strong>Último dia</strong> do preço de lançamento: termina hoje às 23h59.";
        } else if (faltam === 1) {
          textoFaixa.innerHTML = "Preço de lançamento termina <strong>amanhã, " + dataCurta + "</strong>. Depois, o preço sobe.";
        } else {
          textoFaixa.innerHTML = "Preço de lançamento só até <strong>" + semana + ", " + dataCurta + "</strong>. Depois, o preço sobe.";
        }
      }
    }
  }

  /* 1. Período: até 31/12/2026 mostra o bônus de Natal; depois, esconde. */
  var fimNatal = Date.parse(CONFIG.fimDoBonusDeNatal);
  raiz.setAttribute("data-periodo", Date.now() >= fimNatal ? "2027" : "2026");


  /* 2. Checkouts */
  function linkValido(url) { return typeof url === "string" && url.indexOf("http") === 0; }

  function letrasValidas(plano) {
    var lista = CONFIG.checkouts[plano] || {};
    return Object.keys(lista).filter(function (k) { return linkValido(lista[k]); });
  }

  var todas = [];
  Object.keys(CONFIG.checkouts).forEach(function (plano) {
    letrasValidas(plano).forEach(function (l) { if (todas.indexOf(l) === -1) todas.push(l); });
  });

  var params = new URLSearchParams(window.location.search);

  if (todas.length) {
    /* A mesma letra (a, b ou c) vale para as duas versões e fica guardada para a próxima visita,
       assim a pessoa não vê order bumps diferentes se voltar à página. */
    var pedido = (params.get("ck") || "").toLowerCase();
    var letra = null;
    if (todas.indexOf(pedido) > -1) {
      letra = pedido;
    } else {
      try { letra = localStorage.getItem("fc_checkout"); } catch (e) { letra = null; }
      if (todas.indexOf(letra) === -1) letra = todas[Math.floor(Math.random() * todas.length)];
    }
    try { localStorage.setItem("fc_checkout", letra); } catch (e) {}

    document.querySelectorAll(".js-checkout").forEach(function (botao) {
      var plano = botao.getAttribute("data-plano");
      var validas = letrasValidas(plano);
      if (!validas.length) return;

      var letraDoPlano = validas.indexOf(letra) > -1 ? letra : validas[0];
      var destino = new URL(CONFIG.checkouts[plano][letraDoPlano]);

      /* Repassa as UTMs do anúncio para o checkout */
      params.forEach(function (valor, chave) {
        if (chave !== "ck" && !destino.searchParams.has(chave)) destino.searchParams.set(chave, valor);
      });

      botao.setAttribute("href", destino.toString());
      botao.addEventListener("click", function () {
        if (typeof window.fbq === "function") {
          window.fbq("track", "InitiateCheckout", {
            content_name: CONFIG.nomes[plano],
            content_category: "checkout_" + letraDoPlano,
            value: CONFIG.precos[plano],
            currency: "BRL"
          });
        }
      });
    });
  }

  /* 3. Depoimentos */
  var secao = document.getElementById("depoimentos");
  var lista = document.getElementById("lista-depoimentos");
  var itens = DEPOIMENTOS.slice();
  if (secao && lista && itens.length) {
    lista.innerHTML = "";
    var intro = document.getElementById("depo-intro");
    if (intro) intro.textContent = "Alguns dos feedbacks que recebemos das confeiteiras. Toque num print para ver maior.";
    itens.forEach(function (d) {
      var fig = document.createElement("figure");
      fig.className = "depo";
      var descricao = "Depoimento de " + (d.nome || "cliente") + (d.detalhe ? ", " + d.detalhe : "");
      if (d.imagem) {
        var link = document.createElement("a");
        link.className = "js-ampliar";
        link.href = d.imagem;
        var img = document.createElement("img");
        img.src = d.imagem;
        img.loading = "lazy";
        img.width = 390;
        img.height = 844;
        img.alt = descricao + (d.texto ? ": " + d.texto : "");
        link.appendChild(img);
        fig.appendChild(link);
      } else {
        var balao = document.createElement("blockquote");
        balao.className = "depo-balao";
        var p = document.createElement("p");
        p.textContent = d.texto || "";
        balao.appendChild(p);
        fig.appendChild(balao);
      }
      var leg = document.createElement("figcaption");
      var nome = document.createElement("span");
      nome.className = "depo-nome mao";
      nome.textContent = d.nome || "";
      leg.appendChild(nome);
      if (d.detalhe) {
        var det = document.createElement("span");
        det.className = "depo-detalhe";
        det.textContent = d.detalhe;
        leg.appendChild(det);
      }
      fig.appendChild(leg);
      lista.appendChild(fig);
    });
  }

  /* 4. Perguntas frequentes: abre e fecha com animação */
  var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduzir && typeof Element.prototype.animate === "function") {
    raiz.classList.add("faq-js");
    document.querySelectorAll(".perguntas details").forEach(function (item) {
      var resumo = item.querySelector("summary");
      var resposta = item.querySelector(".resposta");
      if (!resumo || !resposta) return;
      var animacao = null;
      var duracao = 320;
      var suave = "cubic-bezier(0.25, 0.8, 0.3, 1)";

      resumo.addEventListener("click", function (ev) {
        ev.preventDefault();
        if (animacao) animacao.cancel();

        if (!item.open || !item.classList.contains("aberto")) {
          item.open = true;
          item.classList.add("aberto");
          var alturaFinal = resposta.scrollHeight;
          animacao = resposta.animate(
            [{ height: "0px", opacity: 0, transform: "translateY(-6px)" },
             { height: alturaFinal + "px", opacity: 1, transform: "translateY(0)" }],
            { duration: duracao, easing: suave }
          );
          animacao.onfinish = function () { animacao = null; };
        } else {
          item.classList.remove("aberto");
          animacao = resposta.animate(
            [{ height: resposta.offsetHeight + "px", opacity: 1 },
             { height: "0px", opacity: 0 }],
            { duration: duracao * 0.85, easing: suave }
          );
          animacao.onfinish = function () { item.open = false; animacao = null; };
        }
      });
    });
  }

  /* 5. Páginas por dentro: carrossel que gira sozinho e tocar para ver maior */
  var carrossel = document.getElementById("carrossel");
  var semAnimacao = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (carrossel && !semAnimacao && window.requestAnimationFrame) {
    var trilho = carrossel.querySelector(".carrossel-trilho");
    var originais = Array.prototype.slice.call(trilho.children);
    var larguraGrupo = 0, posicao = 0, pausado = false, visivel = false, retomar = null, ultimo = 0;
    var VELOCIDADE = 38; /* pixels por segundo */

    var montar = function () {
      /* tira as cópias antigas e mede um grupo com as 4 páginas */
      trilho.querySelectorAll(".copia").forEach(function (el) { el.remove(); });
      var primeiro = originais[0], ultimoItem = originais[originais.length - 1];
      var gap = parseFloat(getComputedStyle(trilho).columnGap) || 0;
      larguraGrupo = ultimoItem.offsetLeft + ultimoItem.offsetWidth + gap - primeiro.offsetLeft;
      if (!larguraGrupo) return false;
      /* copia as páginas até sobrar dos dois lados da tela */
      var copias = 2 + Math.ceil(carrossel.clientWidth / larguraGrupo);
      for (var i = 0; i < copias; i++) {
        originais.forEach(function (fig) {
          var c = fig.cloneNode(true);
          c.classList.add("copia");
          c.setAttribute("aria-hidden", "true");
          c.querySelectorAll("a").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
          trilho.appendChild(c);
        });
      }
      posicao = larguraGrupo;
      carrossel.scrollLeft = posicao;
      return true;
    };

    var ajustar = function () {
      /* quando passa de um grupo inteiro, volta um grupo sem ninguém perceber */
      if (posicao >= larguraGrupo * 2) posicao -= larguraGrupo;
      if (posicao < larguraGrupo * 0.5) posicao += larguraGrupo;
    };

    var passo = function (agora) {
      var dt = ultimo ? Math.min(agora - ultimo, 64) : 16;
      ultimo = agora;
      if (!pausado && visivel) {
        posicao += VELOCIDADE * dt / 1000;
        ajustar();
        carrossel.scrollLeft = posicao;
      }
      requestAnimationFrame(passo);
    };

    var pausar = function () { pausado = true; clearTimeout(retomar); };
    var continuar = function (espera) {
      clearTimeout(retomar);
      retomar = setTimeout(function () { posicao = carrossel.scrollLeft; pausado = false; }, espera);
    };

    if (montar()) {
      carrossel.classList.add("ativo");
      carrossel.addEventListener("mouseenter", pausar);
      carrossel.addEventListener("mouseleave", function () { continuar(0); });
      carrossel.addEventListener("touchstart", pausar, { passive: true });
      carrossel.addEventListener("touchend", function () { continuar(2500); }, { passive: true });
      carrossel.addEventListener("focusin", pausar);
      carrossel.addEventListener("focusout", function () { continuar(1500); });
      carrossel.addEventListener("scroll", function () {
        if (!pausado) return;
        /* se a pessoa arrastar com o dedo até o fim, continua girando sem acabar */
        var atual = carrossel.scrollLeft;
        if (atual >= larguraGrupo * 2) carrossel.scrollLeft = atual - larguraGrupo;
        else if (atual < larguraGrupo * 0.5) carrossel.scrollLeft = atual + larguraGrupo;
      }, { passive: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }).observe(carrossel);
      } else {
        visivel = true;
      }
      var larguraTela = window.innerWidth;
      window.addEventListener("resize", function () {
        if (window.innerWidth === larguraTela) return;
        larguraTela = window.innerWidth;
        montar();
      });
      requestAnimationFrame(passo);
    }
  }

  var janela = document.getElementById("ampliar");
  if (janela && typeof janela.showModal === "function") {
    var imgGrande = janela.querySelector("img");
    document.addEventListener("click", function (ev) {
      var link = ev.target.closest ? ev.target.closest(".js-ampliar") : null;
      if (!link) return;
      ev.preventDefault();
      var miniatura = link.querySelector("img");
      imgGrande.src = link.getAttribute("href");
      imgGrande.alt = miniatura ? miniatura.alt : "";
      janela.showModal();
    });
    janela.querySelector(".ampliar-fechar").addEventListener("click", function () { janela.close(); });
    janela.addEventListener("click", function (ev) { if (ev.target === janela) janela.close(); });
  }

  /* 6. Barra fixa no celular: aparece depois do topo e some na seção das versões */
  var barra = document.getElementById("barra-fixa");
  var topo = document.getElementById("topo");
  var oferta = document.getElementById("oferta");
  if (barra && topo && "IntersectionObserver" in window) {
    var topoVisivel = true, ofertaVisivel = false;
    var atualizar = function () { barra.classList.toggle("visivel", !topoVisivel && !ofertaVisivel); };
    new IntersectionObserver(function (e) { topoVisivel = e[0].isIntersecting; atualizar(); }).observe(topo);
    if (oferta) {
      new IntersectionObserver(function (e) { ofertaVisivel = e[0].isIntersecting; atualizar(); }, { threshold: 0.05 }).observe(oferta);
    }
  }
})();
