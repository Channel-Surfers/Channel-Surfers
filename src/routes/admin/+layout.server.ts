import { themes, type Theme } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
    let themeString = cookies.get('theme');
    // Technically invalid assert, since themeString can be anything, but it's okay since we're not assuming anything from that
    if (!themes.includes(themeString as Theme)) {
        themeString = 'blue';
    }
    const theme = themeString as Theme;

    return {
        theme,
    };
};
