import { getChord, openMidi } from "./course";
let context: AudioContext | undefined;
export const getAudio = () => {
  context ??= new AudioContext();
  void context.resume();
  return context;
};
export function tone(
  midi: number,
  time?: number,
  duration = 1.3,
  volume = 0.12,
) {
  const a = getAudio(),
    start = time ?? a.currentTime;
  const o = a.createOscillator(),
    g = a.createGain(),
    f = a.createBiquadFilter();
  o.type = "triangle";
  o.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  f.type = "lowpass";
  f.frequency.value = 2200;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(volume, start + 0.009);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  o.connect(f);
  f.connect(g);
  g.connect(a.destination);
  o.start(start);
  o.stop(start + duration + 0.02);
}
export function playNote(midi: number) {
  tone(midi);
}
export function playChord(
  name: string,
  up = false,
  time?: number,
  muted = false,
) {
  const a = getAudio(),
    c = getChord(name),
    start = time ?? a.currentTime;
  let notes = c.frets
    .map((f, i) => (f < 0 ? -1 : openMidi[i] + f))
    .filter((n) => n >= 0);
  if (up) notes = notes.reverse();
  notes.forEach((m, i) =>
    tone(m, start + i * 0.018, muted ? 0.07 : 1.4, muted ? 0.045 : 0.065),
  );
}
export function click(time: number, strong = false) {
  const a = getAudio(),
    o = a.createOscillator(),
    g = a.createGain();
  o.frequency.value = strong ? 1050 : 720;
  g.gain.setValueAtTime(0.13, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  o.connect(g);
  g.connect(a.destination);
  o.start(time);
  o.stop(time + 0.05);
}
