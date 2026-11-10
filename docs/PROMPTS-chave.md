# Prompts: chave fusível (versão 2)

Para gerar a imagem e o vídeo da cena da energização do site.
Os prompts estão em inglês porque os geradores entendem melhor; as explicações estão em português.

---

## O que deu errado na primeira rodada

Olhando as 7 imagens geradas:

1. **A chave saiu deitada em cima da cruzeta.** O gerador copiou a pose da foto sobre a madeira: isolador na horizontal e cartucho por baixo, paralelo. Uma chave fusível de verdade fica **em pé e inclinada, presa na lateral da cruzeta** pela ferragem do meio do isolador.
2. **As peças vieram misturadas.** Saíram capuz deformado, olhal solto no lugar errado, gancho duplicado e, numa delas, porcelana marrom de outro modelo. Isso acontece quando o prompt é longo demais: a IA pega pedaços da descrição e monta do jeito dela.
3. **O cenário funcionou:** noite, refletor de sódio, subestação desfocada atrás, plaqueta vermelha e concreto envelhecido. Isso foi mantido.

## A nova estratégia (3 passos, nesta ordem)

1. **Primeiro a chave sozinha, em estúdio, com fundo grafite liso.** É mais fácil a IA acertar o objeto sem cenário. É também o que fica melhor no site: a cena da energização já tem fundo escuro, então a chave "flutua" nele sem emenda.
2. **Depois a mesma chave instalada no poste**, usando a imagem do passo 1 como referência.
3. **O vídeo sai das imagens.** Você gera duas imagens, a chave **aberta** e a chave **fechada**, e usa como **primeiro e último quadro** do vídeo. Isso funciona no Kling, no Runway, no Veo e no Luma ("start/end frame" ou "keyframes"). Assim o vídeo não inventa uma chave nova no meio do caminho.

**Qual imagem usar como referência:** use a **foto de catálogo** (a chave inclinada, isolador cinza, olhal de bronze à esquerda) ou o **render 3D em ângulo**. **Não use** a foto da chave deitada na madeira, porque ela ensina a pose errada. Se quiser usar a foto da sua peça, gire a imagem para a chave ficar em pé antes de enviar.

**Regra para todos os prompts:** a **posição** vem primeiro, depois as peças principais, depois a luz. O resto sai curto. Peça uma chave só.

---

## Passo 1: a chave sozinha, em estúdio (imagem principal do site)

Gere em **4:5** ou **1:1** (a chave é mais alta que larga). O site recorta para desktop e celular.

```
Studio product photograph of ONE 15 kV porcelain distribution fuse cutout, standing upright, tilted about 20 degrees from vertical, three-quarter view, exactly like the reference image. Light grey glazed porcelain insulator on the right with rounded sheds above and below a smooth middle section; a galvanized steel mounting bracket sticks out sideways from the middle of the insulator. Galvanized top arm with a coil spring and a curved copper contact strip, a galvanized J-shaped hook for the load-break tool. Light grey fiberglass fuse tube on the left, parallel to the insulator, closed and locked into the top contact. Bronze pull ring near the top of the tube. Bronze hinge casting at the bottom. Bolted parallel-groove connectors at the top and bottom terminals. Seamless dark graphite background, single warm sodium key light from upper right, cool faint rim light from the left, soft shadow below. 100mm lens, f/8, everything in sharp focus, real material detail: glossy glaze, dull galvanizing, bronze patina. Photorealistic, catalog photography.
```

**No Midjourney**, cole a URL da imagem de referência no começo do prompt e acrescente ao final:
`--ar 4:5 --style raw --iw 2 --no text, logo, second cutout, horizontal, lying down`

**Versão aberta (para o começo da animação):** troque `closed and locked into the top contact. Bronze pull ring near the top of the tube.` por
`swung open: the tube has dropped out of the top contact and hangs pivoted on the bronze bottom hinge, tilted about 35 degrees away from the insulator, the empty top contact clearly visible. Bronze pull ring near the top end of the tube.`

> Gere a fechada primeiro. Quando sair boa, gere a aberta **usando a fechada como referência**, para as duas serem a mesma peça.

---

## Passo 2: a chave instalada no poste, à noite (cartaz da cena)

Use a melhor imagem do passo 1 como referência.

```
The exact fuse cutout from the reference image, now installed outdoors at night: standing upright, tilted about 20 degrees from vertical, its middle mounting bracket bolted to the SIDE face of a weathered concrete crossarm on a concrete utility pole. The cutout hangs in front of the crossarm, not on top of it. Black insulated cable comes down from above into the top terminal, another cable leaves the bottom terminal toward the ground. A small red tag with the word "PERIGO" hangs from the crossarm. Low camera angle, three-quarter view, the cutout fills 60 percent of the frame. Background: dark graphite night sky, out-of-focus substation steel lattice and insulators, one sodium floodlight in the upper right corner giving hard warm rim light. Palette: graphite, porcelain grey, galvanized silver, bronze, one red accent. Photorealistic, cinematic, tense, silent.
```

**No Midjourney:** `--ar 16:9 --style raw --iw 1.5 --no text, logo, second cutout, lying on crossarm, horizontal insulator, brown porcelain`
Para o celular, gere de novo com `--ar 9:16`.

---

## Passo 3: o vídeo do fechamento (a rolagem controla)

Esse é o vídeo que a rolagem avança e volta, quadro a quadro. Configure assim no gerador:
- **primeiro quadro:** a imagem **aberta** do passo 1 (ou do passo 2, se quiser o poste);
- **último quadro:** a imagem **fechada** correspondente;
- **duração:** 5 s; câmera travada, sem cortes, sem câmera lenta.

O prompt descreve **só o movimento**, porque a aparência já vem das imagens:

```
Static locked camera, no camera movement, no cuts. The fuse tube is hanging open. A long orange fiberglass hot stick enters from the lower right, its hook catches the bronze pull ring and pushes the tube upward, pivoting on the bottom hinge. Just before the tube reaches the top contact, a short violent electric arc jumps across the gap: bright white core, orange molten sparks spraying down with gravity. The tube snaps into the top contact with a hard mechanical jolt, the arc vanishes instantly, a thin wisp of smoke rises. The hot stick withdraws. Everything else stays perfectly still. Realistic physics, photorealistic.
```

**Se o gerador não aceitar dois quadros:** use só o primeiro quadro (aberta) e o mesmo prompt. Se o vídeo inventar peças, encurte para `Static camera. The fuse tube swings up on its bottom hinge and locks into the top contact. A brief electric arc with falling sparks at the moment of contact. Nothing else moves.`

**Se aparecer gente ou mão:** acrescente `no people, no hands, only the hot stick is visible`.

---

## Passo extra (opcional): a abertura sob carga, para as redes sociais

Mesma técnica, com os quadros invertidos: **primeiro quadro fechada, último aberta**.

```
Static locked camera, no cuts. A fiberglass hot stick with a load-break tool hooks the J-hook and the pull ring and pulls the tube down sharply. The tube leaves the top contact, a long electric arc stretches across the gap for a fraction of a second, bright white core, orange sparks falling, then the arc snaps out. The tube swings down on its bottom hinge, bounces once and settles hanging open. Thin smoke rises. Hold still for the last second. Realistic physics, photorealistic.
```

---

## Negative prompt (para os geradores que têm esse campo)

```
horizontal insulator, lying on top of crossarm, resting on table, second cutout, duplicate parts, extra hooks, floating parts, deformed hood, brown porcelain, polymer insulator, text, watermark, logo, cartoon, illustration, plastic look, neon glow, lens flare, daylight, people, hands, camera movement, camera shake, cuts, slow motion
```

---

## Depois de gerar: preparar o vídeo para a rolagem

Para a rolagem ficar lisa, o vídeo precisa de quadros-chave densos e sem áudio. Troque os nomes dos arquivos pelos seus:

```bash
ffmpeg -i chave-fechamento.mp4 -an -g 8 -vf scale=1600:-2 -crf 23 chave-fechamento-rolagem.mp4
```

Versão de celular:

```bash
ffmpeg -i chave-fechamento-9x16.mp4 -an -g 8 -vf scale=900:-2 -crf 24 chave-fechamento-rolagem-cel.mp4
```

Me mande:
- a imagem fechada e a aberta do passo 1;
- a imagem do poste do passo 2;
- o vídeo.

No site, o arco, as faíscas, a contagem e a luz se espalhando continuam por cima do vídeo, sincronizados com o instante do contato.
