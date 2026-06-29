<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import * as Tone from "tone";
	import {
		synthNotes,
		synths,
		triggerClap,
		triggerHat,
		triggerKick,
		triggerSnare,
	} from "./lib/constants";
	import type { SynthType } from "./lib/types";

	let bpm: number = $state(120);
	let isPlaying = $state(false);
	let beat = $state(0);
	let chords = $state(synthNotes[0].notes);
	let chordStylePlaying = $state(false);

	$effect(() => {
		transport.bpm.value = bpm;
	});

	const transport = Tone.getTransport();

	let beatIndicators = Array.from({ length: 16 }, (_, i) => i);

	let rows = $state([
		Array.from({ length: 16 }, (_, i) => ({
			type: "hihat",
			active: false,
			length: "16n",
		})),
		Array.from({ length: 16 }, (_, i) => ({
			type: "clap",
			active: false,
			length: "16n",
		})),
		Array.from({ length: 16 }, (_, i) => ({
			type: "snare",
			active: false,
			length: "8n",
		})),
		Array.from({ length: 16 }, (_, i) => ({
			type: "kick",
			active: false,
			length: "16n",
		})),
	]);

	let synthRows = $state([
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: chords[0],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: chords[1],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: chords[2],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: chords[3],
		})),
	]);

	let drumMountId: number;

	onMount(() => {
		drumMountId = transport.scheduleRepeat((time?) => {
			rows.forEach((row) => {
				let perc = row[beat];

				if (perc.active) {
					switch (perc.type) {
						case "hihat":
							triggerHat(time);
							break;
						case "clap":
							triggerClap(time);
							break;
						case "snare":
							triggerSnare(time);
							break;
						case "kick":
							triggerKick(time);
							break;
					}
				}
			});
			chordStylePlaying = false;
			synthRows.forEach((synthRow, si) => {
				let note = synthRow[beat];
				let synthToPlay = synths[si];
				if (note.active) {
					synthToPlay.triggerAttackRelease(chords[si], "16n", time);
					chordStylePlaying = true;
				}
			});
			beat = (beat + 1) % 16;
		}, "16n");
	});

	onDestroy(() => {
		transport.clear(drumMountId);
		transport.stop();
	});

	const handleDrumClick = (rowIndex: number, noteIndex: number) => {
		rows[rowIndex][noteIndex].active = !rows[rowIndex][noteIndex].active;
	};
	const handleNoteClick = (synthRowIndex: number, synthNoteIndex: number) => {
		synthRows[synthRowIndex][synthNoteIndex].active =
			!synthRows[synthRowIndex][synthNoteIndex].active;
	};

	const handleChordsClick = (item: SynthType) => {
		console.log(item.notes);
		chords = item.notes;
		console.log(chords);
	};

	const handlePlay = () => {
		if (!isPlaying) Tone.start();
		transport.start();
		isPlaying = true;
	};

	const handleStop = () => {
		if (!isPlaying) {
			beat = 0;
			synthRows.forEach((synth) => {
				synth.forEach((note) => {
					note.active = false;
				});
			});
			rows.forEach((synth) => {
				synth.forEach((note) => {
					note.active = false;
				});
			});
		}

		transport.stop();
		isPlaying = false;
	};
</script>

<div class="controls">
	<button aria-label="play" onclick={handlePlay}>▶</button>
	<button aria-label="stop" onclick={handleStop}>⏹</button>
	<div class="input-container">
		<label for="bpm">BPM</label>
		<input type="range" min="40" max="240" bind:value={bpm} />
	</div>

	<div class="bpm-container">
		<span>
			{bpm}
		</span>
	</div>
</div>

<div class="sequencer">
	{#each beatIndicators as _, i}
		<div class="beat-indicator" class:live={i === beat ? "live" : ""}></div>
	{/each}
	{#each rows as row, i}
		{#each row as note, j}
			<button
				aria-label="active/deactivate drum sound"
				onclick={() => handleDrumClick(i, j)}
				class="grid"
				class:active={note.active}
				class:bar_break={j % 4 === 0}
			>
			</button>
		{/each}
	{/each}
</div>

<div class="note_sequencer">
	{#each synthRows as row, i}
		{#each row as note, j}
			<button
				aria-label="active/deactivate synth note"
				onclick={() => handleNoteClick(i, j)}
				class="grid"
				class:synth-active={note.active}
				class:bar_break={j % 4 === 0}
			>
			</button>
		{/each}
	{/each}
</div>

<div class="chord-container">
	{#snippet button(item: SynthType)}
		<button
			class="chord-class"
			class:chord-active={chords.join() == item.notes.join()}
			aria-label={item.notes.join() !== chords.join()
				? "current chords playing.."
				: "switch to {item.name} chords"}
			onclick={() => handleChordsClick(item)}>{item.name}</button
		>
	{/snippet}
	{#each synthNotes as synthNote}
		{@render button(synthNote)}
	{/each}
</div>

<style>
	:root {
		--primary-color: #aa3bff;
	}
	.beat-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #555;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-size: 1.5rem;
		margin: 10px auto;
	}
	.beat-indicator.live {
		background: #f105a6;
	}

	.input-container {
		width: 190px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-left: 20px;
		font-size: 1.2em;
		font-weight: 600;
	}

	.sequencer,
	.note_sequencer {
		display: grid;
		grid-template-columns: repeat(16, 1fr);
		gap: 5px;
		width: 100%;
		justify-items: center;
		width: fit-content;
		margin: 0 auto 44px;
	}

	.grid.active {
		background-color: coral;
	}

	.note_sequencer button {
		opacity: 20%;
		border: 1px solid rgb(1, 1, 1);
	}

	.note_sequencer button:nth-child(4n - 1) {
		background-color: rgb(129, 225, 249);
	}
	.note_sequencer button:nth-child(4n -2) {
		background-color: rgb(212, 244, 255);
	}
	.note_sequencer button:nth-child(4n - 3) {
		background-color: rgb(252, 191, 240);
	}
	.note_sequencer button:nth-child(4n) {
		background-color: rgb(255, 233, 233);
	}

	.grid {
		height: 44px;
		width: 44px;
		aspect-ratio: 1;
		border-radius: 10%;
		background-color: rgb(121, 129, 135);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.controls {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin: 20px auto;
	}

	button {
		border: transparent;
	}
	.controls button {
		height: 44px;
		width: 44px;
		font-size: 33px;
		border-radius: 3px;
		color: rgb(84, 83, 83);
	}

	button:hover {
		transform: scale(1.05);
	}

	button:active {
		transform: scale(0.95);
	}
	.controls button:active {
		background-color: coral;
	}

	.bar_break {
		background-color: rgb(177, 180, 182);
	}

	.bpm-container {
		width: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
		font-weight: 600;
	}

	.chord-class {
		width: 60px;
		height: 44px;
		border-radius: 10px;
		display: inline;
		margin: 0 10px 0;
		font-size: 1.2em;
		font-weight: 500;
	}

	.chord-active {
		background-color: rgb(213, 143, 185);
	}

	button.synth-active {
		opacity: 100%;
		border: transparent;
	}
</style>
