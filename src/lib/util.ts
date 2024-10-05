export const sleep = async (delay_ms: number) => await new Promise((res) => setTimeout(() => res(0), delay_ms));

let intersectionObserver: IntersectionObserver | undefined;
const getIntersectionObserver = (): IntersectionObserver => {
    if (intersectionObserver) return intersectionObserver;

    return intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const eventName = entry.isIntersecting ? 'enter' : 'exit';
                entry.target.dispatchEvent(new CustomEvent(eventName));
            });
        }
    );
}

export const viewport = (element: Element) => {
    const intersectionObserver = getIntersectionObserver();
    intersectionObserver.observe(element);
    return {
        destroy: () => {
            intersectionObserver.unobserve(element);
        }
    }
}
