export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function spring(value, velocity, target, stiffness, damping, dt) {
 velocity += ((target - value) * stiffness - velocity * damping) * dt;
 return [value + velocity * dt, velocity];
}
// Inputs are in SVG units. Speed adds a bounded response without changing the locked axis.
export function dragTransform(dx, dy, mode, intensity = 65, speed = 0) {
 const response = (0.45 + intensity / 100 * 0.85) * (1 + clamp(speed / 4000, 0, 0.25));
 return { x: mode === 'y' ? 1 : clamp(1 + dx / 410 * response, 0.45, 1.65), y: mode === 'x' ? 1 : clamp(1 + dy / 330 * response, 0.45, 1.65), skew: mode === 'free' ? clamp(dx / 26 * response, -16, 16) : 0 };
}
