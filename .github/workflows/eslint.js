import { exec } from 'child_process';

exec('npx eslint -f json', (err, stdout) => {
    if (!err) {
        // Everything is fine, so we can skip
        return;
    }

    const data = JSON.parse(stdout);
    // {
    //     "filePath": "/home/funnyboy_roks/dev/school-ext/Channel-Surfers/src/lib/utils.ts",
    //     "messages": [
    //         {
    //             "ruleId": "@typescript-eslint/no-unused-vars",
    //             "severity": 2,
    //             "message": "'f' is assigned a value but never used.",
    //             "line": 6,
    //             "column": 7,
    //             "nodeType": null,
    //             "messageId": "unusedVar",
    //             "endLine": 6,
    //             "endColumn": 8
    //         }
    //     ],
    //     "suppressedMessages": [],
    //     "errorCount": 1,
    //     "fatalErrorCount": 0,
    //     "warningCount": 0,
    //     "fixableErrorCount": 0,
    //     "fixableWarningCount": 0,
    //     "source": "import { type ClassValue, clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\nimport { cubicOut } from 'svelte/easing';\nimport type { TransitionConfig } from 'svelte/transition';\n\nconst f = () => {\n    console.log('f');\n};\n\nexport function cn(...inputs: ClassValue[]) {\n    return twMerge(clsx(inputs));\n}\n\ntype FlyAndScaleParams = {\n    y?: number;\n    x?: number;\n    start?: number;\n    duration?: number;\n};\n\nexport const flyAndScale = (\n    node: Element,\n    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }\n): TransitionConfig => {\n    const style = getComputedStyle(node);\n    const transform = style.transform === 'none' ? '' : style.transform;\n\n    const scaleConversion = (\n        valueA: number,\n        scaleA: [number, number],\n        scaleB: [number, number]\n    ) => {\n        const [minA, maxA] = scaleA;\n        const [minB, maxB] = scaleB;\n\n        const percentage = (valueA - minA) / (maxA - minA);\n        const valueB = percentage * (maxB - minB) + minB;\n\n        return valueB;\n    };\n\n    const styleToString = (style: Record<string, number | string | undefined>): string => {\n        return Object.keys(style).reduce((str, key) => {\n            if (style[key] === undefined) return str;\n            return str + `${key}:${style[key]};`;\n        }, '');\n    };\n\n    return {\n        duration: params.duration ?? 200,\n        delay: 0,\n        css: (t) => {\n            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);\n            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);\n            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);\n\n            return styleToString({\n                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,\n                opacity: t\n            });\n        },\n        easing: cubicOut\n    };\n};\n",
    //     "usedDeprecatedRules": []
    // }
    for (const v of data) {
        if (!v.messages?.length) {
            // this file is fine, skip.
            continue;
        }

        for (const message of v.messages) {
            const args = {
                file: v.filePath,
                line: message.line,
                endLine: message.endLine,
                col: message.column,
                endColumn: message.endColumn,
                title: 'ESLINT-ERROR',
            };
            const argstr = Object.entries(args).map(([k, v]) => `${k}=${v}`).join(',');
            console.log(`::error ${argstr}::${message.message}`);
        }
    }
});
