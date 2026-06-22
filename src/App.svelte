<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import * as Tone from "tone";
	import {
		synthNotes,
		triggerClap,
		triggerHat,
		triggerKick,
		triggerSnare,
	} from "./lib/constants";

	let bpm: number = $state(120);
	let isPlaying = $state(false);
	let beat = $state(0);

	$effect(() => {
		transport.bpm.value = bpm;
	});

	const transport = Tone.getTransport();
	const synthTransport = Tone.getTransport();

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

	const synths = [
		new Tone.Synth().toDestination(),
		new Tone.Synth().toDestination(),
		new Tone.Synth().toDestination(),
		new Tone.Synth().toDestination(),
	];

	let synthRows = $state([
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: synthNotes[0],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: synthNotes[1],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: synthNotes[2],
		})),
		Array.from({ length: 16 }, (_, i) => ({
			active: false,
			note: synthNotes[3],
		})),
	]);

	let drumMountId: number;
	let synthMountId: number;

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
			synthRows.forEach((synthRow, si) => {
				let note = synthRow[beat];
				let synthToPlay = synths[si];

				if (note.active)
					synthToPlay.triggerAttackRelease(
						synthNotes[si],
						"16n",
						time,
					);
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

	const handlePlay = () => {
		if (!isPlaying) Tone.start();
		transport.start();
		isPlaying = true;
	};

	const handleStop = () => {
		if (!isPlaying) beat = 0;

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
		<div class="beat-indicator" class:live={i == beat ? "live" : ""}></div>
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
		margin: 10px auto;
	}
	.beat-indicator.live {
		background: #05f18f;
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

	.grid.active {
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

	.bpm-container {
		width: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
		font-weight: 600;
	}
</style>
