export const sleep = (delay_ms: number): Promise<void> =>
    new Promise((res) => setTimeout(() => res(), delay_ms));

let intersectionObserver: IntersectionObserver | undefined;
const getIntersectionObserver = (): IntersectionObserver => {
    if (intersectionObserver) return intersectionObserver;

    return (intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const eventName = entry.isIntersecting ? 'enter' : 'exit';
            entry.target.dispatchEvent(new CustomEvent(eventName));
        });
    }));
};

export const viewport = (element: Element) => {
    const intersectionObserver = getIntersectionObserver();
    intersectionObserver.observe(element);
    return {
        destroy: () => {
            intersectionObserver.unobserve(element);
        },
    };
};

/**
 * Check if a value matches a tuple and assert for typescript that it is an enum:
 *
 * ```ts
 * if(is(['foo', 'bar'], s)) {
 *     // s is of type 'foo' | 'bar'.
 * }
 * ```
 */
export const is = <const T extends string[]>(t: T, v: unknown): v is T[number] => {
    return typeof v === 'string' && t.includes(v);
};
