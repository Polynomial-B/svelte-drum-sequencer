import * as Tone from "tone";

export const hatsFilter = new Tone.Filter(4400, "highpass").toDestination();
export const hatsEnvelope = new Tone.AmplitudeEnvelope({
  attack: 0.001,
  decay: 0.15,
  sustain: 0,
  release: 0.01,
});

const noise = new Tone.NoiseSynth({
  noise: {
    type: "brown",
  },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0,
  },
}).toDestination();

const body = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 2,
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.1,
  },
}).toDestination();

export function triggerSnare(time?: number) {
  noise.triggerAttackRelease("16n", time);
  body.triggerAttackRelease("C3", "32n", time);
}
