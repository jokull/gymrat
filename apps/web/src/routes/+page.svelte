<script>
	/** @type {import('./$types').PageServerData} */
	export let data;
</script>

<h1>Welcome to SvelteKit</h1>
<div>
	{#each data.workouts as workout}
		<li>
			{workout.description} at {workout.date.toLocaleDateString('is-IS', { dateStyle: 'medium' })}
		</li>
	{/each}
</div>
