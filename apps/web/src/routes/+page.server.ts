import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.user) {
		throw redirect(307, '/login');
	}
	const workouts = await locals.api.workouts.query();
	return { workouts };
};
