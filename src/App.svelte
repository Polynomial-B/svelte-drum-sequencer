<script lang="ts">
	let notes: string[] = Array(64);
	let bpm: number = $state(120);
	let beats: string[] = Array(16);

	// let active: bool[] =
</script>

<div class="controls">
	<button aria-label="play">▶</button>
	<button aria-label="stop">⏹</button>
	<label for="bpm">BPM</label>
	<input type="range" min="40" max="300" bind:value={bpm} />
	<!-- {#each beats as beat}

{/each} -->
	<span>{bpm}</span>
</div>

<div class="sequencer">
	{#each notes as note, i}
		<div
			class="note {i == 0 ? 'active' : ''} {i % 4 == 0
				? 'bar_break'
				: ''}"
		>
			{note}
		</div>
	{/each}
</div>

<style>
	.sequencer {
		display: grid;
		grid-template-columns: repeat(16, 1fr);
		gap: 5px;
		width: 100%;
	}

	.note {
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

	.controls button {
		height: 44px;
		width: 44px;
		border: transparent;
		font-size: 33px;
		border-radius: 3px;
		color: rgb(84, 83, 83);
	}

	.controls button:hover {
		transform: scale(1.05);
	}
	.controls button:active {
		transform: scale(0.9);
		background-color: coral;
	}

	.bar_break {
		background-color: rgb(177, 180, 182);
	}
</style>
