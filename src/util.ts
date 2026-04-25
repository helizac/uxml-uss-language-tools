// Small shared utilities used by the diagnostic providers.

import * as vscode from 'vscode';

/** Levenshtein edit distance between two strings (case-insensitive). */
export function levenshtein(a: string, b: string): number {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) {
        return 0;
    }
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }

    let prev = new Array<number>(b.length + 1);
    let curr = new Array<number>(b.length + 1);
    for (let j = 0; j <= b.length; j++) {
        prev[j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        curr[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                curr[j - 1] + 1,
                prev[j] + 1,
                prev[j - 1] + cost,
            );
        }
        [prev, curr] = [curr, prev];
    }

    return prev[b.length];
}

/**
 * Find the closest candidate to `input`, or `undefined` if no candidate is within `maxDistance`.
 */
export function closestMatch(input: string, candidates: Iterable<string>, maxDistance = 3): string | undefined {
    let best: string | undefined;
    let bestDist = maxDistance + 1;
    for (const c of candidates) {
        const d = levenshtein(input, c);
        if (d < bestDist) {
            bestDist = d;
            best = c;
        }
    }
    return bestDist <= maxDistance ? best : undefined;
}

/** Stable string key for a range — used to look up sidecar suggestions in code actions. */
export function rangeKey(range: vscode.Range): string {
    return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}
