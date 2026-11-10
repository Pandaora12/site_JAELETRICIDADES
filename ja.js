/* J.A Eletricidades — cenas sob medida e movimento-assinatura.
   O motor (sites-incriveis.js) cuida das revelações e das cenas fixas;
   aqui vive só o que é desta página. */
(function () {
  "use strict";

  var doc = document;
  var raiz = doc.documentElement;
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ponteiroFino = window.matchMedia("(pointer: fine)").matches;
  var NS = "http://www.w3.org/2000/svg";

  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
  function faixa(p, a, b) { return limitar((p - a) / (b - a), 0, 1); }
  function suave(t) { return t * t * (3 - 2 * t); }
  function progressoFixo(secao) {
    var ret = secao.getBoundingClientRect();
    var percurso = secao.offsetHeight - window.innerHeight;
    return percurso > 0 ? limitar(-ret.top / percurso, 0, 1) : 0;
  }
  function kv(v) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

  // raio irregular entre dois pontos (deslocamento do ponto médio)
  function raio(x1, y1, x2, y2, rugosidade, niveis) {
    var pts = [[x1, y1], [x2, y2]];
    var desvio = Math.hypot(x2 - x1, y2 - y1) * rugosidade;
    for (var n = 0; n < niveis; n++) {
      var novo = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var len = Math.hypot(dx, dy) || 1;
        var off = (Math.random() * 2 - 1) * desvio;
        novo.push([mx - dy / len * off, my + dx / len * off], b);
      }
      pts = novo;
      desvio *= 0.55;
    }
    return pts;
  }

  /* ====================== 1 · Osciloscópio da abertura ====================== */

  var osc = $(".osc-canvas");
  var oscCtx = osc && osc.getContext("2d");
  var oscFase = 0, ultimoY = window.scrollY, velocidade = 0;

  function dimensionarCanvas(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenharOsc(dt) {
    if (!oscCtx) return;
    var w = osc.clientWidth, h = osc.clientHeight;
    var dy = Math.abs(window.scrollY - ultimoY);
    ultimoY = window.scrollY;
    velocidade += (Math.min(dy, 80) - velocidade) * 0.08;
    oscFase += dt * (1.4 + velocidade * 0.09);
    oscCtx.clearRect(0, 0, w, h);
    // grade
    oscCtx.strokeStyle = "rgba(233,237,228,.06)";
    oscCtx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 48) {
      oscCtx.beginPath(); oscCtx.moveTo(gx + .5, 0); oscCtx.lineTo(gx + .5, h); oscCtx.stroke();
    }
    var meio = h * 0.6, amp = h * (0.2 + Math.min(velocidade, 40) * 0.004);
    var comp = Math.max(w / 3.2, 260) / (1 + velocidade * 0.012);
    var alfas = [0.75, 0.4, 0.22];
    for (var k = 0; k < 3; k++) {
      oscCtx.beginPath();
      for (var x = 0; x <= w; x += 3) {
        var y = meio + Math.sin((x / comp) * Math.PI * 2 - oscFase - k * 2.0944) * amp;
        if (x === 0) oscCtx.moveTo(x, y); else oscCtx.lineTo(x, y);
      }
      oscCtx.strokeStyle = "rgba(233,237,228," + alfas[k] + ")";
      oscCtx.lineWidth = k === 0 ? 1.6 : 1.1;
      oscCtx.stroke();
    }
  }

  /* ====================== 2 · A linha: torres, vãos e cabos ====================== */

  var linhaSecao = $(".s-linha");
  var linhaSvg = $(".linha-svg");

  function el(nome, attrs, pai) {
    var e = doc.createElementNS(NS, nome);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }

  function torre(g, x, chao, topo, H, rotulo) {
    var bw = H * 0.075, tw = H * 0.016;
    var alt = chao - topo;
    var d = "";
    // pernas
    d += "M" + (x - bw) + " " + chao + "L" + (x - tw) + " " + topo;
    d += "M" + (x + bw) + " " + chao + "L" + (x + tw) + " " + topo;
    // treliça: níveis com X
    var niveis = 6;
    var prev = null;
    for (var i = 0; i <= niveis; i++) {
      var t = i / niveis;
      var y = chao - alt * t;
      var hw = bw + (tw - bw) * t;
      d += "M" + (x - hw) + " " + y + "H" + (x + hw);
      if (prev) {
        d += "M" + (x - prev.hw) + " " + prev.y + "L" + (x + hw) + " " + y;
        d += "M" + (x + prev.hw) + " " + prev.y + "L" + (x - hw) + " " + y;
      }
      prev = { y: y, hw: hw };
    }
    // braços (cruzetas)
    var b1 = topo + alt * 0.12, b2 = topo + alt * 0.3;
    var a1 = H * 0.085, a2 = H * 0.065;
    d += "M" + (x - a1) + " " + b1 + "H" + (x + a1) + "L" + (x + tw) + " " + (b1 + alt * 0.06);
    d += "M" + (x - a1) + " " + b1 + "L" + (x - tw) + " " + (b1 + alt * 0.06);
    d += "M" + (x - a2) + " " + b2 + "H" + (x + a2) + "L" + (x + tw * 1.4) + " " + (b2 + alt * 0.05);
    d += "M" + (x - a2) + " " + b2 + "L" + (x - tw * 1.4) + " " + (b2 + alt * 0.05);
    // pico
    d += "M" + (x - tw) + " " + topo + "L" + x + " " + (topo - alt * 0.07) + "L" + (x + tw) + " " + topo;
    el("path", { d: d, "class": "ls-torre" }, g);
    el("text", { x: x - 18, y: topo - alt * 0.1, "class": "ls-txt" }, g).textContent = rotulo;
    var isol = 9;
    var pontos = [[x - a1, b1 + isol], [x + a1, b1 + isol], [x + a2, b2 + isol]];
    pontos.forEach(function (p) {
      el("path", { d: "M" + p[0] + " " + (p[1] - isol) + "V" + p[1], "class": "ls-torre-contorno" }, g);
      el("circle", { cx: p[0], cy: p[1], r: 2.2, "class": "ls-iso" }, g);
    });
    return pontos;
  }

  function construirLinha() {
    if (!linhaSvg) return;
    var trilho = $(".trilho");
    var vaos = $$(".vao", trilho);
    var H = trilho.clientHeight;
    var W = trilho.scrollWidth;
    var estreito = window.innerWidth < 640;
    var chao = H * 0.58;
    var topo = H * (estreito ? 0.34 : 0.22);
    linhaSvg.setAttribute("width", W);
    linhaSvg.setAttribute("height", H);
    linhaSvg.setAttribute("viewBox", "0 0 " + W + " " + H);
    linhaSvg.innerHTML = "";

    var g = el("g", {}, linhaSvg);
    el("path", { d: "M0 " + chao + "H" + W, "class": "ls-chao" }, g);

    var xs = vaos.map(function (v) { return v.offsetLeft; });
    xs.push(vaos[vaos.length - 1].offsetLeft + vaos[vaos.length - 1].offsetWidth);
    // um trecho de cabo entra pela esquerda antes da primeira torre
    var tops = xs.map(function (x, i) {
      return torre(g, x, chao, topo, H, "T-0" + (i + 1));
    });

    var sag = H * 0.06;
    var pulsos = el("g", {}, linhaSvg);
    function cabo(x1, y1, x2, y2) {
      var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag * 2;
      var d = "M" + x1 + " " + y1 + "Q" + cx + " " + cy + " " + x2 + " " + y2;
      el("path", { d: d, "class": "ls-cabo" }, g);
      el("path", { d: d, "class": "ls-pulso", style: "animation-delay:" + (-Math.random() * 4).toFixed(2) + "s" }, pulsos);
    }
    // entrada do lado esquerdo (vem de longe)
    tops[0].forEach(function (p) { cabo(-200, p[1] - 30, p[0], p[1]); });

    for (var i = 0; i < tops.length - 1; i++) {
      var subterraneo = vaos[i] && vaos[i].classList.contains("vao-sub");
      if (subterraneo) {
        var x1 = xs[i], x2 = xs[i + 1];
        var prof = chao + (estreito ? 22 : 34);
        el("path", { d: "M" + (x1 + 30) + " " + (prof - 8) + "H" + (x2 - 30) + "M" + (x1 + 30) + " " + (prof + 8) + "H" + (x2 - 30), "class": "ls-duto" }, g);
        [0, 1, 2].forEach(function (k) {
          var p1 = tops[i][k], p2 = tops[i + 1][k];
          var off = (k - 1) * 4;
          var d = "M" + p1[0] + " " + p1[1] +
            "C" + (p1[0] + 30) + " " + (p1[1] + 40) + " " + (x1 + 18 + off) + " " + (chao - 60) + " " + (x1 + 18 + off) + " " + chao +
            "V" + (prof + off) + "H" + (x2 - 18 + off) + "V" + chao +
            "C" + (x2 - 18 + off) + " " + (chao - 60) + " " + (p2[0] - 30) + " " + (p2[1] + 40) + " " + p2[0] + " " + p2[1];
          el("path", { d: d, "class": "ls-cabo-sub" }, g);
          el("path", { d: d, "class": "ls-pulso", style: "animation-delay:" + (-k * 1.3) + "s" }, pulsos);
        });
        el("text", { x: x1 + 40, y: prof + 28, "class": "ls-txt" }, g).textContent = "DUTO · CABO ISOLADO";
      } else {
        for (var k = 0; k < 3; k++) cabo(tops[i][k][0], tops[i][k][1], tops[i + 1][k][0], tops[i + 1][k][1]);
      }
    }
    // saída para a direita
    tops[tops.length - 1].forEach(function (p) { cabo(p[0], p[1], W + 260, p[1] + 20); });
  }

  /* ====================== 3 · Diagrama unifilar que se desenha ====================== */

  var subSecao = $(".s-sub");
  var tracos = $$(".unifilar .u");
  var marcas = $$(".unifilar .u-num");
  var legendas = $$(".legenda li");
  var terra = $(".unifilar .u-terra");
  var ORDENS = 7;

  function atualizarUnifilar() {
    if (!subSecao) return;
    var folha = $(".folha");
    var r = subSecao.getBoundingClientRect();
    var vh = window.innerHeight;
    // começa quando a seção entra e termina antes de sair
    var p = limitar((vh * 0.55 - r.top) / Math.max(r.height - vh * 0.3, vh * 0.6), 0, 1);
    var total = p * (ORDENS + 0.4);
    tracos.forEach(function (t) {
      var o = +t.getAttribute("data-o");
      var local = limitar(total - o, 0, 1);
      t.style.strokeDashoffset = (1 - local).toFixed(3);
    });
    marcas.forEach(function (m) { m.classList.toggle("on", total - +m.getAttribute("data-o") > 0.7); });
    legendas.forEach(function (l) { l.classList.toggle("on", total - +l.getAttribute("data-o") > 0.7); });
    if (terra) terra.classList.toggle("on", total > 6.6);
  }

  /* ====================== 4 · PICO: a energização ======================
     Linha do tempo (progresso da cena, 7 telas):
     0.08–0.24 elo entra · 0.28–0.58 cartucho gira · 0.58–0.76 contagem 3-2-1
     com arcos crescendo · 0.76 tranco no contato · 0.775–0.90 a luz se
     espalha a partir do contato · 0.88 energizado */

  var cabine = $(".s-cabine");
  var palcoCab = cabine && $(".fx-palco", cabine);
  var grade = $(".cabine-grade");
  var svgChave = $(".chave-fusivel");
  var tubo = $(".cf-tubo");
  var elo = $(".cf-elo");
  var arcos = $$(".cf-arcos .cf-arco");
  var disco = $(".luz-disco");
  var onda = $(".luz-onda");
  var clarao = $(".clarao");
  var faiscasTela = $(".faiscas");
  var fctx = faiscasTela && faiscasTela.getContext("2d");
  var kvEl = $(".kv");
  var barra = $(".medidor-barra");
  var falas = $$(".fala");
  var contagemNum = $(".contagem-num");
  var itens = $$(".checklist li");
  var viradores = $$(".s-cabine [data-flip]");
  var energizado = false;
  var progCabine = 0, progAnterior = 0;
  var raioLuz = 1000;
  var faiscas = [];
  var JAW = [196, 151];

  function girar(px, py, cx, cy, graus) {
    var a = graus * Math.PI / 180;
    var dx = px - cx, dy = py - cy;
    return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
  }

  function anguloTubo(p) {
    if (p < 0.28) return -30;
    if (p < 0.58) return -30 + 25 * suave(faixa(p, 0.28, 0.58));       // até -5°
    if (p < 0.76) return -5 + 3.5 * faixa(p, 0.58, 0.76);               // rasteja até -1,5°
    if (p < 0.77) return -1.5 + 3.1 * faixa(p, 0.76, 0.77);             // tranco: passa do ponto
    if (p < 0.79) return 1.6 * (1 - suave(faixa(p, 0.77, 0.79)));        // e assenta
    return 0;
  }

  // ponto do SVG da chave -> coordenadas do palco
  function noPalco(x, y) {
    var m = svgChave.getScreenCTM();
    if (!m) return [0, 0];
    var pt = svgChave.createSVGPoint();
    pt.x = x; pt.y = y;
    var s = pt.matrixTransform(m);
    var r = palcoCab.getBoundingClientRect();
    return [s.x - r.left, s.y - r.top];
  }

  function dimensionarLuz() {
    if (!palcoCab) return;
    var w = palcoCab.clientWidth, h = palcoCab.clientHeight;
    raioLuz = Math.hypot(w, h) + 40;
    [disco, onda].forEach(function (c) {
      c.style.width = c.style.height = (raioLuz * 2) + "px";
    });
    if (faiscasTela) dimensionarCanvas(faiscasTela);
  }

  function soltarFaiscas(o, n, forca) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = (0.3 + Math.random()) * forca;
      faiscas.push({
        x: o[0], y: o[1],
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - forca * 0.35,
        vida: 0.5 + Math.random() * 0.7, max: 1.2,
        quente: Math.random() > 0.55
      });
    }
  }

  function desenharFaiscas(dt) {
    if (!fctx) return;
    fctx.clearRect(0, 0, faiscasTela.clientWidth, faiscasTela.clientHeight);
    for (var i = faiscas.length - 1; i >= 0; i--) {
      var f = faiscas[i];
      f.vida -= dt;
      if (f.vida <= 0) { faiscas.splice(i, 1); continue; }
      f.vy += 1100 * dt;
      f.vx *= 0.985;
      f.x += f.vx * dt; f.y += f.vy * dt;
      fctx.globalAlpha = limitar(f.vida / 0.6, 0, 1);
      fctx.strokeStyle = f.quente ? "#F2C14E" : "#FBFCF7";
      fctx.lineWidth = 1.5;
      fctx.beginPath();
      fctx.moveTo(f.x, f.y);
      fctx.lineTo(f.x - f.vx * 0.025, f.y - f.vy * 0.025);
      fctx.stroke();
    }
    fctx.globalAlpha = 1;
  }

  function pontos(pts) {
    return pts.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
  }

  function aplicarCabine(p, dt) {
    progAnterior = progCabine;
    progCabine = p;
    dt = dt || 0;

    // elo fusível sobe para dentro do cartucho
    var e = suave(faixa(p, 0.08, 0.24));
    elo.setAttribute("transform", "translate(0 " + ((1 - e) * 250).toFixed(1) + ")");
    elo.style.opacity = e > 0 ? 1 : 0;

    // cartucho
    var ang = anguloTubo(p);
    tubo.setAttribute("transform", "rotate(" + ang.toFixed(2) + " 180 472)");

    // arcos: crescem durante a contagem
    var tensao = p >= 0.58 && p < 0.765 ? faixa(p, 0.58, 0.76) : 0;
    var topoTubo = girar(194, 154, 180, 472, ang);
    if (tensao > 0 && !reduzido && Math.random() < 0.3 + tensao * 0.65) {
      arcos[0].setAttribute("points", pontos(raio(topoTubo[0], topoTubo[1], JAW[0], JAW[1], 0.4, 4)));
      arcos[1].setAttribute("points", tensao > 0.35 ? pontos(raio(topoTubo[0] - 30, topoTubo[1] + 8, 150, 108 + Math.random() * 10, 0.45, 4)) : "");
      arcos[2].setAttribute("points", tensao > 0.6 ? pontos(raio(JAW[0], JAW[1], JAW[0] + (Math.random() - .5) * 60, JAW[1] - 20 - Math.random() * 40, 0.5, 3)) : "");
      arcos[0].style.strokeWidth = (1.6 + tensao * 2.6).toFixed(2);
    } else {
      arcos.forEach(function (a) { a.setAttribute("points", ""); });
    }

    // origem da luz = mandíbula do contato
    var o = noPalco(JAW[0], JAW[1]);

    // faíscas: algumas na contagem, explosão no contato
    if (!reduzido) {
      if (tensao > 0.2 && Math.random() < tensao * 0.5) soltarFaiscas(o, 1 + Math.round(tensao * 3), 260 + tensao * 260);
      if (progAnterior < 0.76 && p >= 0.76) soltarFaiscas(o, 90, 760);
      if (p < 0.5 && faiscas.length) faiscas.length = 0;
      desenharFaiscas(dt);
    }

    // tremor: cresce na contagem, pancada no contato
    var tremor = 0;
    if (p >= 0.58 && p < 0.76) tremor = 0.4 + 2.4 * faixa(p, 0.58, 0.76);
    else if (p >= 0.76 && p < 0.8) tremor = 10 * (1 - faixa(p, 0.76, 0.8));
    if (tremor > 0 && !reduzido) {
      grade.style.transform = "translate(" + ((Math.random() - .5) * tremor).toFixed(1) + "px," + ((Math.random() - .5) * tremor).toFixed(1) + "px)";
    } else if (grade.style.transform) {
      grade.style.transform = "";
    }

    // clarão curto no contato
    var c = p < 0.76 ? 0 : p < 0.768 ? faixa(p, 0.76, 0.768) : 1 - faixa(p, 0.768, 0.8);
    clarao.style.opacity = (c * 0.75).toFixed(3);

    // a luz se espalha a partir do contato
    var s = faixa(p, 0.775, 0.92);
    s = 1 - Math.pow(1 - s, 1.5);
    var pw = palcoCab.clientWidth, ph = palcoCab.clientHeight;
    var rNec = Math.max(Math.hypot(o[0], o[1]), Math.hypot(pw - o[0], o[1]), Math.hypot(o[0], ph - o[1]), Math.hypot(pw - o[0], ph - o[1])) + 20;
    var k = rNec / raioLuz;
    var base = "translate(" + (o[0] - raioLuz).toFixed(1) + "px," + (o[1] - raioLuz).toFixed(1) + "px) ";
    disco.style.transform = base + "scale(" + (s * k).toFixed(4) + ")";
    onda.style.transform = base + "scale(" + ((s > 0 && s < 1 ? Math.min(1, s * 1.07 + 0.02) : s) * k).toFixed(4) + ")";
    var r = rNec * s;
    var pr = palcoCab.getBoundingClientRect();
    viradores.forEach(function (v) {
      var b = v.getBoundingClientRect();
      var cx = [b.left - pr.left, b.right - pr.left], cy = [b.top - pr.top, b.bottom - pr.top];
      // a parte do bloco mais perto do contato manda: vira quando a luz alcança metade dele
      var dx = Math.abs((cx[0] + cx[1]) / 2 - o[0]) * (v.classList.contains("chave-palco") ? 0.4 : 1);
      var dy = Math.abs((cy[0] + cy[1]) / 2 - o[1]) * (v.classList.contains("chave-palco") ? 0.4 : 1);
      v.classList.toggle("acesa", s >= 1 || r >= Math.hypot(dx, dy));
    });

    // leitura
    var kvAgora = 13.8 * suave(faixa(p, 0.78, 0.9));
    kvEl.textContent = kv(kvAgora);
    barra.style.transform = "scaleX(" + (kvAgora / 13.8).toFixed(3) + ")";

    // contagem
    if (contagemNum) {
      var n = p < 0.64 ? "3" : p < 0.7 ? "2" : "1";
      if (contagemNum.textContent !== n) contagemNum.textContent = n;
    }

    // falas
    falas.forEach(function (f) {
      var de = +f.getAttribute("data-de"), ate = +f.getAttribute("data-ate");
      var dentro = Math.min(faixa(p, de, de + 0.03), 1 - faixa(p, ate - 0.03, ate));
      if (de === 0) dentro = 1 - faixa(p, ate - 0.03, ate);
      if (ate > 1) dentro = faixa(p, de, de + 0.04);
      f.style.opacity = dentro.toFixed(3);
      f.style.transform = "translateY(" + ((1 - dentro) * 18).toFixed(1) + "px)";
      f.style.visibility = dentro > 0.01 ? "visible" : "hidden";
    });

    // checklist
    itens.forEach(function (li) {
      var ok = p >= +li.getAttribute("data-on");
      if (li.classList.contains("ok") !== ok) {
        li.classList.toggle("ok", ok);
        var em = $("em", li);
        em.textContent = ok ? em.getAttribute("data-on-txt") : em.getAttribute("data-off");
      }
    });

    // estado global
    var ret = cabine.getBoundingClientRect();
    var agora = (p >= 0.88 || ret.bottom < window.innerHeight * 0.5) && ret.top <= 0;
    definirEnergizado(agora);
  }

  var statusTxt = $(".status-txt");
  function definirEnergizado(sim) {
    if (sim === energizado) return;
    energizado = sim;
    raiz.classList.toggle("energizado", sim);
    statusTxt.innerHTML = sim ? "Energizado<span class=\"status-kv\"> · 13,8 kV</span>" : "Desenergizado";
  }

  /* ====================== 5 · Portas dos cubículos ====================== */

  function armarPortas() {
    var cubs = $$(".cubiculo");
    if (reduzido) { cubs.forEach(function (c) { c.classList.add("aberto"); }); return; }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        var i = cubs.indexOf(en.target);
        setTimeout(function () { en.target.classList.add("aberto"); }, 140 + (i % 3) * 160);
      });
    }, { threshold: 0.45 });
    cubs.forEach(function (c) { obs.observe(c); });
  }

  /* ====================== Trajeto da energia (navegação) ====================== */

  var trajeto = $$(".trajeto li");
  function atualizarTrajeto() {
    var meio = window.innerHeight * 0.5;
    var ativo = -1;
    trajeto.forEach(function (li, i) {
      var s = doc.getElementById(li.getAttribute("data-alvo"));
      var r = s.getBoundingClientRect();
      if (r.top <= meio) ativo = i;
    });
    trajeto.forEach(function (li, i) {
      li.classList.toggle("ativo", i === ativo);
      li.classList.toggle("passou", i < ativo);
    });
  }

  /* ====================== ASSINATURA: cursor-arco elétrico ====================== */

  var tela = $(".arco-cursor");
  var tctx = tela.getContext("2d");
  var alvos = $$("[data-arco]");
  var mx = -999, my = -999, ultimoRaio = 0, raioAtual = null, toque = null;

  function pontoMaisProximo(r, x, y) {
    return [limitar(x, r.left, r.right), limitar(y, r.top, r.bottom)];
  }

  function corDoAlvo(alvo) {
    return getComputedStyle(alvo).color;
  }

  function procurarAlvo(x, y, alcance) {
    var melhor = null, dist = alcance;
    alvos.forEach(function (a) {
      var r = a.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || r.width === 0) return;
      var p = pontoMaisProximo(r, x, y);
      var d = Math.hypot(p[0] - x, p[1] - y);
      if (d < dist && d > 4) { dist = d; melhor = { el: a, p: p, d: d }; }
    });
    return melhor;
  }

  function desenharArco(agora) {
    tctx.clearRect(0, 0, tela.clientWidth, tela.clientHeight);
    var origem = toque ? toque : { x: mx, y: my };
    if (toque && agora - toque.t > 420) toque = null;
    if (origem.x < -900) return;
    var alvo = procurarAlvo(origem.x, origem.y, toque ? 260 : 150);
    if (!alvo) { raioAtual = null; return; }
    if (!raioAtual || agora - ultimoRaio > 55) {
      ultimoRaio = agora;
      raioAtual = {
        pts: raio(origem.x, origem.y, alvo.p[0], alvo.p[1], 0.22, 5),
        ramo: Math.random() > 0.5 ? raio(origem.x, origem.y, alvo.p[0] + (Math.random() - .5) * 40, alvo.p[1] + (Math.random() - .5) * 30, 0.3, 4) : null,
        cor: corDoAlvo(alvo.el)
      };
    }
    var forca = 1 - alvo.d / (toque ? 260 : 150);
    function tracar(pts, larg, cor, alfa) {
      tctx.beginPath();
      pts.forEach(function (q, i) { if (i) tctx.lineTo(q[0], q[1]); else tctx.moveTo(q[0], q[1]); });
      tctx.globalAlpha = alfa;
      tctx.strokeStyle = cor;
      tctx.lineWidth = larg;
      tctx.lineJoin = "bevel";
      tctx.stroke();
    }
    var halo = energizado ? "#C8F53B" : "#E5322B";
    tracar(raioAtual.pts, 4, halo, 0.35 * forca + 0.1);
    tracar(raioAtual.pts, 1.3, raioAtual.cor, 0.5 + forca * 0.5);
    if (raioAtual.ramo) tracar(raioAtual.ramo, 0.9, raioAtual.cor, 0.35 * forca);
    // ponto de impacto
    tctx.globalAlpha = 0.9;
    tctx.fillStyle = raioAtual.cor;
    tctx.beginPath(); tctx.arc(alvo.p[0], alvo.p[1], 2 + Math.random() * 1.5, 0, 6.283); tctx.fill();
    tctx.globalAlpha = 1;
  }

  function armarCursor() {
    if (reduzido) return;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse" || e.pointerType === "pen") { mx = e.clientX; my = e.clientY; }
    }, { passive: true });
    doc.addEventListener("pointerleave", function () { mx = my = -999; });
    window.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") toque = { x: e.clientX, y: e.clientY, t: performance.now() };
    }, { passive: true });
  }

  /* ====================== FECHAMENTO: chave arrastável ====================== */

  var chave = $(".chave-faca");
  var lamina = $(".cfk-lamina");
  var arcoChave = $(".cfk-arco");
  var txtChave = $(".cfk-txt");
  var aviso = $(".contato-aviso");
  var ABERTA = 40, anguloChave = ABERTA, fechada = false, arrastando = false, inicioArraste = null;
  var animChave = null;

  function porAngulo(a) {
    anguloChave = a;
    lamina.setAttribute("transform", "rotate(" + a.toFixed(2) + " 150 404)");
  }

  function fecharChave() {
    if (fechada) return;
    fechada = true;
    porAngulo(0);
    raiz.classList.add("chave-fechada");
    chave.setAttribute("aria-pressed", "true");
    txtChave.textContent = "FECHADA";
    var bl = $(".btn-ligar");
    if (bl) { bl.querySelector("span").textContent = "Ligado"; bl.disabled = true; }
    aviso.textContent = "Circuito fechado. Agora é com a gente.";
    if (!reduzido) {
      var fim = performance.now() + 380;
      (function faisca() {
        var agora = performance.now();
        if (agora > fim) { arcoChave.setAttribute("points", ""); return; }
        var pts = raio(150, 112, 150 + (Math.random() - .5) * 30, 96, 0.5, 3);
        arcoChave.setAttribute("points", pts.map(function (q) { return q.join(","); }).join(" "));
        requestAnimationFrame(faisca);
      })();
    }
  }

  function animarPara(alvo, depois) {
    cancelAnimationFrame(animChave);
    var de = anguloChave, t0 = performance.now(), dur = reduzido ? 1 : 420;
    (function passo(agora) {
      var t = limitar((agora - t0) / dur, 0, 1);
      var e = alvo < de ? 1 - Math.pow(1 - t, 3) : 1 - Math.pow(1 - t, 2) * (1 - Math.sin(t * Math.PI) * 0.15);
      porAngulo(de + (alvo - de) * e);
      if (t < 1) animChave = requestAnimationFrame(passo);
      else if (depois) depois();
    })(t0);
  }

  function anguloDoPonteiro(e) {
    var svg = chave.querySelector("svg");
    var m = svg.getScreenCTM();
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var l = pt.matrixTransform(m.inverse());
    var a = Math.atan2(l.x - 150, 404 - l.y) * 180 / Math.PI;
    return limitar(a, 0, ABERTA);
  }

  function armarChave() {
    porAngulo(ABERTA);
    var bl = $(".btn-ligar");
    if (bl) bl.addEventListener("click", function () { if (!fechada) animarPara(0, fecharChave); });
    chave.addEventListener("pointerdown", function (e) {
      if (fechada) return;
      arrastando = true;
      inicioArraste = { x: e.clientX, y: e.clientY };
      chave.setPointerCapture(e.pointerId);
      cancelAnimationFrame(animChave);
    });
    chave.addEventListener("pointermove", function (e) {
      if (!arrastando || fechada) return;
      porAngulo(anguloDoPonteiro(e));
      if (anguloChave < 3) { arrastando = false; fecharChave(); }
    });
    function soltar(e) {
      if (!arrastando || fechada) return;
      arrastando = false;
      var moveu = inicioArraste && Math.hypot(e.clientX - inicioArraste.x, e.clientY - inicioArraste.y) > 6;
      if (!moveu || anguloChave < 14) animarPara(0, fecharChave);
      else animarPara(ABERTA);
    }
    chave.addEventListener("pointerup", soltar);
    chave.addEventListener("pointercancel", function () { arrastando = false; animarPara(ABERTA); });
    chave.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") { e.preventDefault(); animarPara(0, fecharChave); }
    });
  }

  /* ====================== Régua de rolagem (voltímetro) ====================== */

  var regua = $(".regua");
  var reguaCursor = $(".regua-cursor");
  var reguaPreench = $(".regua-preench");
  var reguaKv = $(".regua-kv");
  var ultimoKv = "";
  var topoBtn = $(".topo");
  var topoProg = $(".topo-progresso");
  if (topoBtn) topoBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
  });

  function atualizarRegua() {
    if (!regua) return;
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? limitar(window.scrollY / max, 0, 1) : 0;
    var h = regua.clientHeight;
    reguaCursor.style.transform = "translateY(" + (p * h - reguaCursor.offsetHeight / 2).toFixed(1) + "px)";
    reguaPreench.style.transform = "scaleY(" + p.toFixed(4) + ")";
    if (topoProg) topoProg.style.strokeDashoffset = (1 - p).toFixed(4);
    if (topoBtn) topoBtn.classList.toggle("visivel", window.scrollY > window.innerHeight * 0.7);
    var t = kv(13.8 * p);
    if (t !== ultimoKv) {
      ultimoKv = t; reguaKv.textContent = t;
      regua.classList.add("ativa");
      clearTimeout(atualizarRegua.espera);
      atualizarRegua.espera = setTimeout(function () { regua.classList.remove("ativa"); }, 1100);
    }
  }

  function armarRegua() {
    if (!regua) return;
    var arrastando = false;
    function irPara(e) {
      var r = regua.getBoundingClientRect();
      var p = limitar((e.clientY - r.top) / r.height, 0, 1);
      window.scrollTo(0, p * (doc.documentElement.scrollHeight - window.innerHeight));
    }
    regua.addEventListener("pointerdown", function (e) { arrastando = true; regua.setPointerCapture(e.pointerId); irPara(e); });
    regua.addEventListener("pointermove", function (e) { if (arrastando) irPara(e); });
    regua.addEventListener("pointerup", function () { arrastando = false; });
    regua.addEventListener("pointercancel", function () { arrastando = false; });
  }

  /* ====================== ciclo ====================== */

  function redimensionar() {
    if (osc) dimensionarCanvas(osc);
    dimensionarCanvas(tela);
    construirLinha();
    dimensionarLuz();
  }

  var t0 = performance.now();
  function laco(agora) {
    var dt = Math.min((agora - t0) / 1000, 0.05);
    t0 = agora;
    if (osc && osc.getBoundingClientRect().top < window.innerHeight) desenharOsc(dt);
    atualizarUnifilar();
    if (cabine) aplicarCabine(progressoFixo(cabine), dt);
    atualizarTrajeto();
    atualizarRegua();
    desenharArco(agora);
    requestAnimationFrame(laco);
  }

  function iniciar() {
    redimensionar();
    armarPortas();
    armarCursor();
    armarChave();
    armarRegua();
    if (reduzido) {
      desenharOsc(0);
      aplicarCabine(1, 0);
      viradores.forEach(function (v) { v.classList.add("acesa"); });
      atualizarTrajeto();
      atualizarRegua();
      window.addEventListener("scroll", function () { atualizarTrajeto(); atualizarRegua(); }, { passive: true });
      return;
    }
    requestAnimationFrame(laco);
    var espera;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(redimensionar, 120);
    });
  }

  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(iniciar);
  else window.addEventListener("load", iniciar);
})();
