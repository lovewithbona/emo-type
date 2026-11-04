import './style.css';
import { emotions } from './emotions.js';
import { spring, dragTransform, clamp } from './physics.js';
import { layoutType, updateTypeColor } from './typography.js';
import { exportPNG } from './export.js';
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = { emotion: 'joy', mode: 'x', intensity: 65, x: 1, y: 1, skew: 0, vx: 0, vy: 0, vs: 0, target: { x: 1, y: 1, skew: 0 }, dragging: false, dark: false };
let pointer = null, previous = 0, toastTimer;
const notify = message => { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2500); };
const svg = $('art'), type = $('type');
Object.entries(emotions).forEach(([key, emotion]) => {
 const button = document.createElement('button'); button.dataset.emotion = key; button.title = emotion.name; button.setAttribute('aria-label', `${emotion.english} ${emotion.name}`);
 button.textContent = emotion.english;
 button.addEventListener('click', () => setEmotion(key)); $('emotions').append(button);
});
function typeColor() { return state.dark ? emotions[state.emotion].color : emotions[state.emotion].ink; }
function setEmotion(key) {
 state.emotion = key; const emotion = emotions[key]; document.documentElement.style.setProperty('--emotion', emotion.color);
 updateTypeColor(type, typeColor());
 document.querySelectorAll('[data-emotion]').forEach(button => { const active = button.dataset.emotion === key; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', active); });
}
function setMode(mode) {
 state.mode = mode; resetPose();
 document.querySelectorAll('[data-mode]').forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', active); });
}
function fitText() { layoutType(type, $('text-input').value, typeColor()); }
$('text-input').addEventListener('input', fitText);
$('modes').addEventListener('click', event => { const button = event.target.closest('button'); if (button) setMode(button.dataset.mode); });
function setIntensity(value) { state.intensity = Number(value); $('intensity').value = value; $('intensity-value').textContent = String(value).padStart(2,'0'); $('intensity').style.setProperty('--progress', `${value}%`); }
$('intensity').addEventListener('input', event => setIntensity(event.target.value));
const point = event => new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
type.addEventListener('pointerdown', event => {
 if (pointer !== null || event.button > 0) return;
 event.preventDefault(); const p = point(event); pointer = event.pointerId; state.dragging = true; state.origin = p; state.base = { x: state.x, y: state.y, skew: state.skew }; state.last = { p, time: event.timeStamp }; state.vx = state.vy = state.vs = 0;
 type.setPointerCapture(pointer); type.classList.add('dragging');
});
type.addEventListener('pointermove', event => {
 if (event.pointerId !== pointer) return; const p = point(event), dt = Math.max((event.timeStamp - state.last.time)/1000,.008);
 const speed = Math.hypot(p.x-state.last.p.x,p.y-state.last.p.y)/dt;
 const change = dragTransform(p.x-state.origin.x,p.y-state.origin.y,state.mode,state.intensity,speed);
 const next = { x: state.mode === 'y' ? 1 : clamp(state.base.x + change.x-1,.45,1.65), y: state.mode === 'x' ? 1 : clamp(state.base.y + change.y-1,.45,1.65), skew: state.mode === 'free' ? clamp(state.base.skew + change.skew,-16,16) : 0 };
 state.vx = state.vx*.55 + clamp((next.x-state.x)/dt,-4,4)*.45; state.vy = state.vy*.55 + clamp((next.y-state.y)/dt,-4,4)*.45; state.vs = clamp((next.skew-state.skew)/dt,-50,50);
 Object.assign(state,next); state.last = { p, time: event.timeStamp };
});
function release(event) {
 if (event.pointerId !== pointer) return; pointer = null; state.dragging = false; type.classList.remove('dragging');
 if (event.type === 'pointercancel' || event.timeStamp-state.last.time > 90) state.vx = state.vy = state.vs = 0;
 if (reduced.matches) { state.target = { x: state.x, y: state.y, skew: state.skew }; state.vx = state.vy = state.vs = 0; }
 else { const kick = .25 + state.intensity / 100 * .8; state.vx *= kick; state.vy *= kick; state.vs *= kick; }
}
['pointerup','pointercancel','lostpointercapture'].forEach(name => type.addEventListener(name, release));
type.addEventListener('keydown', event => {
 if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return; event.preventDefault();
 const change = dragTransform(event.key === 'ArrowLeft' ? -80 : event.key === 'ArrowRight' ? 80 : 0,event.key === 'ArrowUp' ? -80 : event.key === 'ArrowDown' ? 80 : 0,state.mode,state.intensity);
 Object.assign(state,change); if (reduced.matches) state.target = {...change};
});
$('background').addEventListener('click', () => { state.dark = !state.dark; $('artboard').classList.toggle('dark', state.dark); setEmotion(state.emotion); });
function resetPose() { state.target = {x:1,y:1,skew:0}; state.x = state.y = 1; state.skew = state.vx = state.vy = state.vs = 0; }
$('reset').addEventListener('click', () => {
 resetPose(); $('text-input').value = 'HOW DO YOU FEEL?'; setMode('x'); setIntensity(65); state.dark = false; $('artboard').classList.remove('dark');
 setEmotion('joy'); fitText(); notify('새로운 기분으로, 다시 시작.');
});
$('random').addEventListener('click', () => {
 const amount = .15 + state.intensity/100*.45;
 state.target = { x: state.mode === 'y' ? 1 : 1+(Math.random()-.5)*amount, y: state.mode === 'x' ? 1 : 1+(Math.random()-.5)*amount, skew: state.mode === 'free' ? (Math.random()-.5)*14 : 0 };
 if (reduced.matches) Object.assign(state,state.target); notify(`${emotions[state.emotion].english} — 같은 감정, 새로운 모양.`);
});
$('export').addEventListener('click', async () => {
 const button = $('export'); button.disabled = true; button.setAttribute('aria-busy','true');
 try { await exportPNG(svg, state.dark ? '#1d1f1a' : '#faf9f6'); notify('지금의 감정을 PNG로 저장했어요.'); }
 catch (error) { console.error(error); notify('저장하지 못했어요. 다시 시도해 주세요.'); }
 finally { button.disabled = false; button.removeAttribute('aria-busy'); }
});
$('controls-toggle').addEventListener('click', () => { const expanded = $('controls-toggle').getAttribute('aria-expanded') === 'true'; $('controls-toggle').setAttribute('aria-expanded',!expanded); $('controls-toggle').setAttribute('aria-label', expanded ? '컨트롤 펼치기' : '컨트롤 접기'); $('control-body').hidden = expanded; $('controls-toggle').querySelector('span').textContent = expanded ? '+' : '−'; });
document.addEventListener('visibilitychange', () => { previous = 0; });
reduced.addEventListener('change', () => { state.vx = state.vy = state.vs = 0; });
function animate(now) {
 const dt = Math.min((now - previous)/1000 || 1/60,.025); previous = now;
 const emotion = emotions[state.emotion], amount = state.intensity/100, t = now/1000;
 if (!state.dragging && !reduced.matches) {
 const stiffness = emotion.stiffness * (.65+amount*.6), damping = emotion.damping * (1.35-amount*.5);
 [state.x,state.vx] = spring(state.x,state.vx,state.target.x,stiffness,damping,dt); [state.y,state.vy] = spring(state.y,state.vy,state.target.y,stiffness,damping,dt); [state.skew,state.vs] = spring(state.skew,state.vs,state.target.skew,stiffness,damping,dt);
 // Keep fast release momentum finite, even at maximum intensity.
 state.x = clamp(state.x,.35,1.85); state.y = clamp(state.y,.35,1.85); state.skew = clamp(state.skew,-22,22);
 }
 let x=0,y=0,rotation=0,sx=1,sy=1;
 if (!reduced.matches && amount) {
 const phase = t * emotion.speed * (.45+amount);
 if (state.emotion === 'joy') { y = -Math.abs(Math.sin(phase))*17*amount; rotation = Math.sin(phase/2)*1.2*amount; }
 if (state.emotion === 'anger') { x = (Math.sin(phase*2.7)+Math.sin(phase*4.13)) * 3.3*amount; rotation = Math.sin(phase*1.7)*.7*amount; sy += Math.sin(phase)*.018*amount; }
 if (state.emotion === 'sadness') { y = (1+Math.sin(phase))*15*amount; sy -= (1+Math.sin(phase))*.025*amount; }
 if (state.emotion === 'anxiety') { x = Math.sin(phase*2.7)*3*amount; y = Math.cos(phase*1.9)*2*amount; rotation = Math.sin(phase)*.6*amount; }
 if (state.emotion === 'calm') { sy += Math.sin(phase)*.018*amount; sx += Math.sin(phase)*.012*amount; }
 }
 $('motion').setAttribute('transform',`translate(${600+x} ${360+y}) rotate(${rotation}) scale(${sx} ${sy}) translate(-600 -360)`);
 $('deform').setAttribute('transform',`translate(600 360) skewX(${state.skew}) scale(${state.x} ${state.y}) translate(-600 -360)`);
 requestAnimationFrame(animate);
}
setEmotion('joy'); setIntensity(65); fitText(); requestAnimationFrame(animate);
