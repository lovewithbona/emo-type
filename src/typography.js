const NS = 'http://www.w3.org/2000/svg';
const sans = 'Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const serif = 'Georgia, "Apple SD Gothic Neo", serif';
export function layoutType(group, input, color) {
 const value = input.trim() || 'HOW DO YOU FEEL?';
 let lines;
 if (value.toUpperCase() === 'HOW DO YOU FEEL?') lines = ['HOW DO', 'YOU', 'FEEL?'];
 else {
  // Segment on graphemes so Korean syllables and emoji sequences stay intact.
  const units = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(value)].map(item => item.segment) : Array.from(value);
  const count = units.length <= 9 ? 1 : units.length <= 24 ? 2 : 3;
  lines = [];
  while (units.length) { const size = Math.ceil(units.length / (count - lines.length)); let split = size;
   const space = units.lastIndexOf(' ', size); if (space > size * 0.55 && lines.length < count - 1) split = space + 1;
   lines.push(units.splice(0, split).join('').trim());
  }
 }
 group.replaceChildren();
 const positions = lines.length === 1 ? [385] : lines.length === 2 ? [305, 480] : [240, 390, 565];
 lines.forEach((line, index) => {
  const text = document.createElementNS(NS, 'text');
  text.textContent = line; text.setAttribute('x', '600'); text.setAttribute('y', positions[index]); text.setAttribute('text-anchor', 'middle');
  const italic = lines.length > 1 && index === lines.length - 1;
  text.setAttribute('font-family', italic ? serif : sans); text.setAttribute('font-weight', italic ? '400' : '900'); text.setAttribute('font-style', italic ? 'italic' : 'normal');
  const size = lines.length === 1 ? 190 : index === 1 && lines.length === 3 ? 200 : 168;
  text.setAttribute('font-size', size); text.setAttribute('letter-spacing', italic ? '-10' : '-11'); text.setAttribute('fill', color);
  group.append(text);
  const width = text.getComputedTextLength();
  if (width > 760) {
   const fitted = size * 760 / width;
   text.setAttribute('font-size', fitted); text.setAttribute('letter-spacing', (italic ? -10 : -11) * fitted / size);
   const fittedWidth = text.getComputedTextLength();
   if (fittedWidth > 760) { const ratio = 760 / fittedWidth; text.setAttribute('font-size', fitted * ratio); text.setAttribute('letter-spacing', (italic ? -10 : -11) * fitted * ratio / size); }
  }
  text.setAttribute('data-line', index);
 });
}
export function updateTypeColor(group, color) { group.querySelectorAll('text').forEach(text => text.setAttribute('fill', color)); }
