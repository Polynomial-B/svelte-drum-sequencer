import * as Tone from "tone";

const kickTone = "F2";

// * Hi Hats

const hatsFilter = new Tone.Filter(4400, "highpass").toDestination();

const hiHats = new Tone.NoiseSynth({
  envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 },
});
hiHats.connect(hatsFilter);

export function triggerHat(time?: number) {
  hiHats.triggerAttackRelease("16n", time);
}

// * Snare

const noiseFilter = new Tone.Filter({
  type: "highpass",
  frequency: 1800,
}).toDestination();

const noise = new Tone.NoiseSynth({
  noise: {
    type: "white",
  },
  envelope: {
    attack: 0.0005,
    decay: 0.12,
    sustain: 0,
    release: 0.03,
  },
}).connect(noiseFilter);

const body = new Tone.MembraneSynth({
  pitchDecay: 0.015,
  octaves: 2.5,
  oscillator: {
    type: "triangle",
  },
  envelope: {
    attack: 0.001,
    decay: 0.12,
    sustain: 0,
    release: 0.02,
  },
}).toDestination();

export function triggerSnare(time?: number) {
  const t = time ?? Tone.now();

  noise.triggerAttackRelease(0.12, t, 0.9);

  body.triggerAttackRelease("G2", "32n", t, 0.7);
}

// * Kick

const kick = new Tone.MembraneSynth().toDestination();

export function triggerKick(time?: number) {
  kick.triggerAttackRelease(kickTone, "16n", time);
}

// * Clap

const clapBus = new Tone.Gain(0.9).toDestination();

const hp = new Tone.Filter({
  type: "highpass",
  frequency: 700,
});

const bp = new Tone.Filter({
  type: "bandpass",
  frequency: 2200,
  Q: 1.5,
});

hp.connect(bp);
bp.connect(clapBus);

const clapTransient = new Tone.NoiseSynth({
  noise: {
    type: "white",
  },
  envelope: {
    attack: 0.0005,
    decay: 0.01,
    sustain: 0,
    release: 0.005,
  },
}).connect(hp);

const clapTail = new Tone.NoiseSynth({
  noise: {
    type: "pink",
  },
  envelope: {
    attack: 0.001,
    decay: 0.12,
    sustain: 0,
    release: 0.04,
  },
}).connect(hp);

export function triggerClap(time?: number) {
  const t = time ?? Tone.now();

  clapTransient.triggerAttackRelease("128n", t, 1.0);
  clapTransient.triggerAttackRelease("128n", t + 0.009, 0.8);
  clapTransient.triggerAttackRelease("128n", t + 0.017, 0.6);
  clapTransient.triggerAttackRelease("128n", t + 0.026, 0.45);

  clapTail.triggerAttackRelease(0.12, t + 0.03, 0.9);
}
