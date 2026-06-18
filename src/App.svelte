<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import * as Tone from "tone";

	let bpm: number = $state(120);
	let isPlaying = $state(false);
	let beat = $state(0);

	const transport = Tone.getTransport();

	let beatIndicators = Array.from({ length: 16 }, (_, i) => i);

	const synths = [
		new Tone.Synth().toDestination(),
		new Tone.Synth().toDestination(),
		new Tone.Synth().toDestination(),
		new Tone.MembraneSynth().toDestination(),
	];

	const synthNotes = ["E2", "G3", "B3", "D2"];

	let rows = $state([
		Array.from({ length: 16 }, (_, i) => ({
			note: synthNotes[3],
			active: false,
		})),
		Array.from({ length: 16 }, (_, i) => ({
			note: synthNotes[2],
			active: false,
		})),
		Array.from({ length: 16 }, (_, i) => ({
			note: synthNotes[1],
			active: false,
		})),
		Array.from({ length: 16 }, (_, i) => ({
			note: synthNotes[0],
			active: false,
		})),
	]);

	let mountId: number;

	onMount(() => {
		mountId = transport.scheduleRepeat((time) => {
			rows.forEach((row, index) => {
				let synth = synths[index];
				let note = row[beat];
				if (note.active)
					synth.triggerAttackRelease(note.note, "16n", time);
			});
			beat = (beat + 1) % 16;
		}, "16n");
	});

	onDestroy(() => {
		transport.clear(mountId);
		transport.stop();
	});

	const handleNoteClick = (rowIndex: number, noteIndex: number) => {
		rows[rowIndex][noteIndex].active = !rows[rowIndex][noteIndex].active;
	};

	const handlePlay = () => {
		if (!isPlaying) Tone.start();
		console.log("playing");
		transport.bpm.value = bpm;
		transport.start();
		isPlaying = true;
	};

	const handleStop = () => {
		if (!isPlaying) beat = 0;

		console.log("stopped");
		transport.stop();
		isPlaying = false;
	};
</script>

<div class="controls">
	<button aria-label="play" onclick={handlePlay}>▶</button>
	<button aria-label="stop" onclick={handleStop}>⏹</button>
	<label for="bpm">BPM</label>
	<input type="range" min="40" max="300" bind:value={bpm} />

	<span>{bpm}</span>
</div>

<div class="sequencer">
	{#each beatIndicators as _, i}
		<div class="beat-indicator" class:live={i == beat ? "live" : ""}></div>
	{/each}
	{#each rows as row, i}
		{#each row as note, j}
			<button
				aria-label="active/deactivate note"
				onclick={() => handleNoteClick(i, j)}
				class="note"
				class:active={note.active}
				class:bar_break={j % 4 === 0}
			>
			</button>
		{/each}
	{/each}
</div>

<style>
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
		margin: 0 auto;
	}
	.beat-indicator.live {
		background: #05f18f;
	}

	.sequencer {
		display: grid;
		grid-template-columns: repeat(16, 1fr);
		gap: 5px;
		width: 100%;
		justify-items: center;
		width: fit-content;
		margin: 0 auto;
	}

	.note {
		height: 44px;
		width: 44px;
		aspect-ratio: 1;
		border-radius: 10%;
		background-color: rgb(121, 129, 135);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.note.active {
		background-color: coral;
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
		transform: scale(0.9);
	}
	.controls button:active {
		background-color: coral;
	}

	.bar_break {
		background-color: rgb(177, 180, 182);
	}
</style>
