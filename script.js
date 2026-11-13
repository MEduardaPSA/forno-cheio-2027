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

  5. FAIXA DE LANÇAMENTO: a faixa vermelha do topo diz que o preço vale para as primeiras
     "compradoras" (100). Quando chegar nesse número de vendas na Cakto, mude "ativo" para false:
     a faixa some. Lembre de mudar também o preço na Cakto e na página.

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
    compradoras: 100
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
    if (!CONFIG.lancamento || !CONFIG.lancamento.ativo) {
      faixa.hidden = true;
    } else {
      var vagas = document.getElementById("faixa-vagas");
      if (vagas) vagas.textContent = CONFIG.lancamento.compradoras;
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

  /* 5. Páginas por dentro: tocar para ver maior */
  var janela = document.getElementById("ampliar");
  if (janela && typeof janela.showModal === "function") {
    var imgGrande = janela.querySelector("img");
    document.querySelectorAll(".js-ampliar").forEach(function (link) {
      link.addEventListener("click", function (ev) {
        ev.preventDefault();
        var miniatura = link.querySelector("img");
        imgGrande.src = link.getAttribute("href");
        imgGrande.alt = miniatura ? miniatura.alt : "";
        janela.showModal();
      });
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
