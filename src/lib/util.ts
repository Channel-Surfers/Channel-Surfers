import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const sleep = (delayMs: number): Promise<void> =>
    new Promise((res) => setTimeout(() => res(), delayMs));

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

export const elapsedTime = (event: Date): string => {
    dayjs.extend(relativeTime);
    return dayjs(event).fromNow();
};

export const debounce = <T extends (...args: unknown[]) => void>(callback: T, wait = 500) => {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), wait);
    };
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}