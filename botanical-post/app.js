const svg = document.querySelector('#artwork');
const stamp = document.querySelector('#stamp');
const namespace = 'http://www.w3.org/2000/svg';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const variants = {
  lilac: { paper: '#afa4b9', panel: '#abb9ad', ink: '#f1e9ef', accent: '#a09ac1', stem: '#c0b7ad', value: '24', portrait: false, name: '雾紫' },
  indigo: { paper: '#293c78', panel: '#24386d', ink: '#c3c5dc', accent: '#8d9bc3', stem: '#acb8bb', value: '36', portrait: false, name: '靛蓝' },
  charcoal: { paper: '#292823', panel: '#292823', ink: '#bc5846', accent: '#e2d4ad', stem: '#9e9e8e', value: '50', portrait: true, name: '墨黑' },
  ochre: { paper: '#ad925a', panel: '#a69771', ink: '#eee4c4', accent: '#d3b995', stem: '#ddd3ad', value: '80', portrait: true, name: '赭金' }
};
let seed = 2048;
let foilGradient;
let reflection;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let animationFrame = 0;

function random(min = 0, max = 1) {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return min + seed / 4294967296 * (max - min);
}

function add(tag, attributes = {}, parent = svg) {
  const element = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent.append(element);
  return element;
}

function text(value, x, y, size, parent, extra = {}) {
  const element = add('text', { x, y, 'font-size': size, 'font-family': 'Georgia, Times New Roman, serif', ...extra }, parent);
  element.textContent = value;
  return element;
}

function makeMask(defs, width, height) {
  const mask = add('mask', { id: 'perforations', maskUnits: 'userSpaceOnUse', x: -4, y: -4, width: width + 8, height: height + 8 }, defs);
  add('rect', { width, height, fill: 'white' }, mask);
  const spacing = 43;
  for (let x = spacing / 2; x < width; x += spacing) {
    add('circle', { cx: x, cy: 0, r: 12, fill: 'black' }, mask);
    add('circle', { cx: x, cy: height, r: 12, fill: 'black' }, mask);
  }
  for (let y = spacing / 2; y < height; y += spacing) {
    add('circle', { cx: 0, cy: y, r: 12, fill: 'black' }, mask);
    add('circle', { cx: width, cy: y, r: 12, fill: 'black' }, mask);
  }
}

function makeDefinitions(width, height) {
  const defs = add('defs');
  makeMask(defs, width, height);
  const texture = add('filter', { id: 'paperGrain', x: '0%', y: '0%', width: '100%', height: '100%' }, defs);
  add('feTurbulence', { type: 'fractalNoise', baseFrequency: '.8', numOctaves: 3, stitchTiles: 'stitch', seed: 12 }, texture);
  add('feColorMatrix', { type: 'saturate', values: 0 }, texture);
  const roughness = add('filter', { id: 'leafTexture', x: '0%', y: '0%', width: '100%', height: '100%' }, defs);
  add('feTurbulence', { type: 'fractalNoise', baseFrequency: '.19', numOctaves: 3, seed: 7, result: 'noise' }, roughness);
  add('feColorMatrix', { in: 'noise', type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  9 0 0 0 -4.1' }, roughness);
  const patchMask = add('mask', { id: 'foilPatches', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width, height }, defs);
  add('rect', { width, height, fill: 'white', filter: 'url(#leafTexture)' }, patchMask);
  foilGradient = add('linearGradient', { id: 'gold', gradientUnits: 'userSpaceOnUse', x1: 0, y1: height, x2: width, y2: 0 }, defs);
  const goldStops = [[0, '#6f5932'], [.18, '#b9a26a'], [.36, '#f1e7b3'], [.44, '#b09a59'], [.53, '#fff8d5'], [.61, '#b9a56a'], [.78, '#e0cd8c'], [1, '#756037']];
  for (const [offset, color] of goldStops) add('stop', { offset, 'stop-color': color }, foilGradient);
  const shine = add('radialGradient', { id: 'reflection', gradientUnits: 'userSpaceOnUse', cx: width * .35, cy: height * .3, r: width * .65 }, defs);
  add('stop', { offset: 0, 'stop-color': '#fff5ce', 'stop-opacity': '.21' }, shine);
  add('stop', { offset: .4, 'stop-color': '#fff1db', 'stop-opacity': '.04' }, shine);
  add('stop', { offset: 1, 'stop-color': '#fff1db', 'stop-opacity': 0 }, shine);
  return shine;
}

function leaf(x, y, length, angle, color, parent) {
  const group = add('g', { transform: `translate(${x} ${y}) rotate(${angle})` }, parent);
  add('path', { d: `M0 0 C${-length * .42} ${-length * .22} ${-length * .19} ${-length * .75} 0 ${-length} C${length * .3} ${-length * .6} ${length * .28} ${-length * .2} 0 0Z`, fill: color, opacity: random(.5, .9) }, group);
  add('path', { d: `M0 0 Q${length * .04} ${-length * .5} 0 ${-length}`, fill: 'none', stroke: '#ece4d0', 'stroke-width': .65, opacity: .6 }, group);
  for (let i = 1; i < 5; i++) {
    const y = -length * i / 6;
    add('path', { d: `M0 ${y} l${length * .14} ${-length * .12} M0 ${y} l${-length * .15} ${-length * .14}`, fill: 'none', stroke: '#eee9db', 'stroke-width': .4, opacity: .4 }, group);
  }
}

function flower(x, y, radius, color, accent, kind, parent) {
  const group = add('g', { transform: `translate(${x} ${y}) rotate(${random(-35, 35)})` }, parent);
  const layers = kind === 'carnation' ? 5 : 3;
  const count = kind === 'carnation' ? 13 : 19;
  for (let layer = 0; layer < layers; layer++) {
    const length = radius * (1 - layer * .15);
    for (let i = 0; i < count; i++) {
      const angle = 360 * i / count + layer * 11 + random(-3, 3);
      const reach = length * random(.84, 1.12);
      const bend = random(-.2, .2) * reach;
      const halfWidth = kind === 'carnation' ? reach * .24 : reach * .085;
      const tip = kind === 'carnation'
        ? `L${bend + halfWidth * .5} ${-reach * 1.03} l${-halfWidth * .3} ${reach * .075} l${-halfWidth * .38} ${-reach * .065} l${-halfWidth * .3} ${reach * .07} l${-halfWidth * .4} ${-reach * .04}`
        : `Q${bend + halfWidth * .1} ${-reach * 1.04} ${bend - halfWidth * .4} ${-reach * .96}`;
      const d = `M0 -2 C${halfWidth} ${-reach * .2} ${bend + halfWidth} ${-reach * .65} ${bend + halfWidth * .7} ${-reach * .95} ${tip} C${bend - halfWidth} ${-reach * .65} ${-halfWidth} ${-reach * .16} 0 -2Z`;
      add('path', { d, fill: layer % 2 ? accent : color, opacity: random(.7, 1), stroke: '#e9e0d5', 'stroke-width': .45, transform: `rotate(${angle})` }, group);
      add('path', { d: `M0 -3 Q${bend * .5} ${-reach * .6} ${bend} ${-reach * .96}`, fill: 'none', stroke: layer % 2 ? color : accent, 'stroke-width': .55, opacity: .65, transform: `rotate(${angle})` }, group);
    }
  }
  for (let i = 0; i < 70; i++) {
    const angle = i * 2.39996;
    const distance = Math.sqrt(i / 70) * radius * .17;
    add('circle', { cx: Math.cos(angle) * distance, cy: Math.sin(angle) * distance, r: random(.65, 1.5), fill: i % 3 ? '#e1cf97' : '#9d916e' }, group);
  }
}

function drawPlants(parent, variant) {
  const group = add('g', {}, parent);
  const portrait = variant.portrait;
  const points = portrait
    ? [[202, 157, 39], [316, 131, 44], [361, 249, 48], [181, 296, 43], [278, 369, 46], [407, 420, 39], [130, 449, 43], [247, 486, 43], [360, 556, 38]]
    : [[330, 236, 72], [493, 143, 61], [612, 264, 82]];
  const root = portrait ? [269, 651] : [310, 501];
  for (const [x, y, radius] of points) {
    add('path', { d: `M${root[0]} ${root[1]} C${x + 35} ${y + 160} ${x - 15} ${y + 65} ${x} ${y}`, stroke: variant.stem, 'stroke-width': portrait ? 1.6 : 2.3, fill: 'none' }, group);
    const sides = portrait ? 2 : 3;
    for (let i = 0; i < sides; i++) {
      const t = .37 + i * .18;
      const lx = root[0] + (x - root[0]) * t;
      const ly = root[1] + (y - root[1]) * t;
      leaf(lx, ly, random(28, portrait ? 46 : 73), (i % 2 ? 1 : -1) * random(35, 78), i % 2 ? variant.accent : variant.stem, group);
    }
    flower(x, y, radius, variant.ink, variant.accent, portrait ? 'carnation' : 'aster', group);
  }
  if (portrait) {
    add('path', { d: 'M267 647 C216 604 179 671 252 662 C298 607 335 650 275 660 M261 659 C213 688 245 696 210 720 M274 658 C304 699 326 657 340 713', fill: 'none', stroke: '#c2ae66', 'stroke-width': 9 }, group);
    add('path', { d: 'M267 647 C216 604 179 671 252 662 C298 607 335 650 275 660 M261 659 C213 688 245 696 210 720', fill: 'none', stroke: '#e0d1a2', 'stroke-width': 1.2 }, group);
  }
  return group;
}

function renderVariant(key) {
  const variant = variants[key];
  seed = 2048;
  const width = variant.portrait ? 550 : 900;
  const height = variant.portrait ? 770 : 630;
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('aria-label', `${variant.name}金箔植物邮票，${variant.value} cents`);
  stamp.classList.toggle('portrait', variant.portrait);
  reflection = makeDefinitions(width, height);
  const paper = add('g', { mask: 'url(#perforations)' });
  add('rect', { width, height, fill: variant.paper }, paper);
  if (!variant.portrait) {
    add('rect', { x: 62, y: 64, width: 595, height: 491, rx: 5, fill: variant.panel }, paper);
    add('rect', { x: 62, y: 64, width: 595, height: 491, rx: 5, stroke: '#d1bb80', 'stroke-width': 1.5, fill: 'none' }, paper);
  }
  const printed = add('g', {}, paper);
  const goldText = add('g', { fill: 'url(#gold)' }, printed);
  text(variant.value, 71, variant.portrait ? 126 : 171, variant.portrait ? 101 : 120, goldText, { 'letter-spacing': -6 });
  text('cents', 75, variant.portrait ? 163 : 214, 38, goldText, { 'letter-spacing': 1 });
  text('BOTANICAL', width - 54, height - 72, variant.portrait ? 19 : 57, goldText, { transform: `rotate(-90 ${width - 54} ${height - 72})`, 'letter-spacing': variant.portrait ? 7 : 5 });
  text('postage', 75, height - 125, 31, goldText);
  text('stamp', 75, height - 86, 30, goldText, { 'letter-spacing': 3 });
  text('0089 · FLORA', width - 212, 112, 20, goldText, { transform: `rotate(23 ${width - 212} 112)`, 'letter-spacing': 3 });
  const plant = drawPlants(printed, variant);
  const foiled = plant.cloneNode(true);
  // Gold leaf follows the printed artwork, with worn, irregular missing patches.
  for (const element of foiled.querySelectorAll('*')) {
    const fill = element.getAttribute('fill');
    const stroke = element.getAttribute('stroke');
    if (fill && fill !== 'none') element.setAttribute('fill', 'white');
    if (stroke && stroke !== 'none') element.setAttribute('stroke', 'white');
  }
  const plantMask = add('mask', { id: 'plantSilhouette', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width, height }, svg.querySelector('defs'));
  plantMask.append(foiled);
  const goldLayer = add('g', { mask: 'url(#foilPatches)' }, paper);
  add('rect', { width, height, fill: 'url(#gold)', mask: 'url(#plantSilhouette)' }, goldLayer);
  const cancellation = add('g', { fill: 'none', stroke: 'url(#gold)', 'stroke-width': 1.7, opacity: .64 }, paper);
  const cx = width - 90;
  const cy = variant.portrait ? height - 90 : 78;
  add('circle', { cx, cy, r: 126 }, cancellation);
  add('circle', { cx, cy, r: 120 }, cancellation);
  text('BOTANICAL MAIL', cx - 112, cy + 4, 19, cancellation, { fill: 'url(#gold)', stroke: 'none', transform: `rotate(-31 ${cx} ${cy})`, 'letter-spacing': 3 });
  for (let i = 0; i < 5; i++) {
    add('path', { d: `M${cx - 180} ${cy + 43 + i * 9} q32 -8 65 0 t65 0 t65 0`, opacity: .65 }, cancellation);
  }
  const wear = add('g', { opacity: .14 }, paper);
  for (let i = 0; i < 780; i++) {
    const x = random(0, width);
    const y = random(0, height);
    add('ellipse', { cx: x, cy: y, rx: random(.3, 1.2), ry: random(.3, 1.5), fill: i % 3 ? '#2a261e' : '#f7f0df' }, wear);
  }
  add('rect', { width, height, filter: 'url(#paperGrain)', opacity: .19, style: 'mix-blend-mode:soft-light', 'pointer-events': 'none' }, paper);
  add('rect', { width, height, fill: 'url(#reflection)', style: 'mix-blend-mode:screen', 'pointer-events': 'none' }, paper);
  targetX = 0;
  targetY = 0;
  updateLight();
}

function updateLight() {
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width;
  const height = viewBox.height;
  const lightX = .35 + currentX * 1.5;
  const lightY = .28 + currentY;
  foilGradient.setAttribute('x1', (lightX - .6) * width);
  foilGradient.setAttribute('y1', (lightY + .6) * height);
  foilGradient.setAttribute('x2', (lightX + .6) * width);
  foilGradient.setAttribute('y2', (lightY - .6) * height);
  reflection.setAttribute('cx', lightX * width);
  reflection.setAttribute('cy', lightY * height);
  if (!reducedMotion) stamp.style.transform = `rotateX(${-currentY * 13}deg) rotateY(${currentX * 16}deg) rotateZ(${currentX * .8}deg)`;
}

function animate() {
  currentX += (targetX - currentX) * .12;
  currentY += (targetY - currentY) * .12;
  updateLight();
  if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .0005) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    animationFrame = 0;
  }
}

function schedule() {
  if (!animationFrame) animationFrame = requestAnimationFrame(animate);
}

stamp.addEventListener('pointermove', event => {
  const bounds = document.querySelector('#gallery').getBoundingClientRect();
  targetX = Math.max(-.6, Math.min(.6, (event.clientX - bounds.left) / bounds.width - .5));
  targetY = Math.max(-.6, Math.min(.6, (event.clientY - bounds.top) / bounds.height - .5));
  schedule();
});
stamp.addEventListener('pointerdown', event => {
  stamp.setPointerCapture(event.pointerId);
});
stamp.addEventListener('pointerup', event => {
  stamp.releasePointerCapture(event.pointerId);
});
stamp.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
  schedule();
});
stamp.addEventListener('keydown', event => {
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'ArrowLeft') targetX = Math.max(-.6, targetX - .15);
  if (event.key === 'ArrowRight') targetX = Math.min(.6, targetX + .15);
  if (event.key === 'ArrowUp') targetY = Math.max(-.6, targetY - .15);
  if (event.key === 'ArrowDown') targetY = Math.min(.6, targetY + .15);
  if (event.key === 'Home') targetX = targetY = 0;
  schedule();
});
for (const input of document.querySelectorAll('input[name="variant"]')) {
  input.addEventListener('change', () => {
    renderVariant(input.value);
    document.querySelector('#hint').textContent = `${variants[input.value].name} · 移动光线，拾起一片金色。`;
    schedule();
  });
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  } else {
    schedule();
  }
});
renderVariant('lilac');
