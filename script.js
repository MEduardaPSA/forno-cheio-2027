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

  4. DEPOIMENTOS: cole os depoimentos reais na lista DEPOIMENTOS, logo abaixo do CONFIG.
     - Enquanto a lista estiver vazia, a seção de depoimentos fica escondida.
     - Para ver como a seção fica antes de ter depoimentos, abra a página com ?ver=depoimentos no fim do endereço.
     - Use só depoimentos de verdade, com autorização da confeiteira para publicar.
*/
var CONFIG = {
  checkouts: {
    ebook: {
      a: "COLE_AQUI_O_LINK_DO_CHECKOUT_EBOOK_A",
      b: "COLE_AQUI_O_LINK_DO_CHECKOUT_EBOOK_B",
      c: "COLE_AQUI_O_LINK_DO_CHECKOUT_EBOOK_C"
    },
    completo: {
      a: "COLE_AQUI_O_LINK_DO_CHECKOUT_COMPLETO_A",
      b: "COLE_AQUI_O_LINK_DO_CHECKOUT_COMPLETO_B",
      c: "COLE_AQUI_O_LINK_DO_CHECKOUT_COMPLETO_C"
    }
  },
  precos: { ebook: 10.00, completo: 27.90 },
  nomes: { ebook: "Forno Cheio 2027 - só o e-book", completo: "Forno Cheio 2027 - versão completa" },
  fimDoBonusDeNatal: "2027-01-01T00:00:00-03:00"
};

/*
  Cada depoimento tem:
  - texto:   o que ela escreveu, com as palavras dela (pode deixar vazio se usar imagem);
  - nome:    o primeiro nome dela;
  - detalhe: o que ela vende e a cidade, por exemplo "bolos e doces em Goiânia";
  - imagem:  opcional. Caminho de um print da conversa, por exemplo "img/depo-ana.jpg".
             Se tiver imagem, ela aparece no lugar do texto.

  Exemplo do formato (apague as barras // para usar):
  // { texto: "Escreva aqui o que ela disse.", nome: "Nome", detalhe: "o que vende, em qual cidade", imagem: "" },
*/
var DEPOIMENTOS = [

];

(function () {
  var raiz = document.documentElement;

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
  var mostrarExemplo = params.get("ver") === "depoimentos";
  var itens = DEPOIMENTOS.slice();
  if (!itens.length && mostrarExemplo) {
    itens = [1, 2, 3].map(function () {
      return { texto: "[Cole aqui a mensagem real da confeiteira, com as palavras dela.]", nome: "[Primeiro nome]", detalhe: "[o que vende], em [cidade]", imagem: "" };
    });
  }
  if (secao && lista && itens.length) {
    itens.forEach(function (d) {
      var fig = document.createElement("figure");
      fig.className = "depo";
      if (d.imagem) {
        var img = document.createElement("img");
        img.className = "depo-print";
        img.src = d.imagem;
        img.loading = "lazy";
        img.alt = "Mensagem de " + (d.nome || "cliente") + (d.texto ? ": " + d.texto : "");
        fig.appendChild(img);
      } else {
        var balao = document.createElement("blockquote");
        balao.className = "depo-balao";
        var p = document.createElement("p");
        p.textContent = d.texto || "";
        balao.appendChild(p);
        fig.appendChild(balao);
      }
      var leg = document.createElement("figcaption");
      var forte = document.createElement("strong");
      forte.textContent = d.nome || "";
      leg.appendChild(forte);
      if (d.detalhe) leg.appendChild(document.createTextNode(", " + d.detalhe));
      fig.appendChild(leg);
      lista.appendChild(fig);
    });
    if (!DEPOIMENTOS.length) {
      var aviso = document.createElement("p");
      aviso.className = "depo-aviso";
      aviso.textContent = "Prévia da seção. Ela só aparece para as visitantes quando você colar depoimentos reais na lista DEPOIMENTOS do script.js.";
      lista.parentNode.appendChild(aviso);
    }
    secao.hidden = false;
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

  /* 5. Barra fixa no celular: aparece depois do topo e some na seção das versões */
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
