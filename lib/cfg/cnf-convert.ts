import { CFG, CFGRule, isNonterminal } from "../cfg"
import { partition } from "lodash"

/**
 * Get all the indices at which `elem` occurs
 */
function getAllIndices<T>(collection: T[], elem: T): number[] {
    const ret: number[] = []
    collection.forEach((e, idx) => {
        if (e === elem) {
            ret.push(idx)
        }
    })
    return ret
}

/**
 * Compute the power set of a given collection
 */
function powerset<T>(coll: T[]): T[][] {
    const subsets: T[][] = [[]]
    for (const e of coll) {
        const n = subsets.length
        for (let i = 0; i < n; i++) {
            const pre = subsets[i]
            subsets.push([...pre, e])
        }
    }
    return subsets
}

/**
 * Helper function for CNF conversion
 * Modifies in place
 */
function newStartSymbol(cfg: CFG) {
    const newStart = cfg.startSymbol + "_newstart"
    return new CFG(newStart, [
        ...cfg.rules,
        { lhs: newStart, rhs: [cfg.startSymbol] },
    ])
}

/**
 * Helper function for CNF
 */
function removeBlankRHS(rules: CFGRule[], startSymbol: string) {
    const [blankRules, finalRules] = partition(
        rules,
        ({ lhs, rhs }) => lhs !== startSymbol && rhs.length === 0
    )

    for (const blank of blankRules) {
        const badNonterminal = blank.lhs
        const newRules = finalRules
            .filter(({ rhs }) => rhs.includes(badNonterminal))
            .flatMap((parentRule) => {
                const indices = getAllIndices(parentRule.rhs, badNonterminal)
                return powerset(indices)
                    .slice(1) // exclude empty set from powerset
                    .map((subset) => ({
                        lhs: parentRule.lhs,
                        rhs: parentRule.rhs.filter(
                            (_, i) => !subset.includes(i)
                        ),
                    }))
            })
        finalRules.push.apply(finalRules, newRules)
    }

    return finalRules
}

function removeOneLengthRules(rules: CFGRule[]) {
    const [oneLengthRules, finalRules] = partition(
        rules,
        ({ rhs }) => rhs.length === 1 && isNonterminal(rhs[0])
    )

    for (const oneLengthRule of oneLengthRules) {
        const lhs = oneLengthRule.lhs
        const rhs = oneLengthRule.rhs[0]

        const childRules = finalRules.filter(
            (r) => r.lhs === rhs && r.rhs.length !== 1
        )
        const newRules = childRules.map((r) => ({ lhs, rhs: r.rhs }))
        finalRules.push.apply(finalRules, newRules)
    }

    return finalRules
}

function removeLongRules(rules: CFGRule[]) {
    const [longRules, alrightRules] = partition(
        rules,
        ({ rhs }) => rhs.length > 2
    )

    const shortenedRules = longRules.flatMap((long, rulesIdx) => {
        let symbol_idx = 0
        const rhsTemp = [...long.rhs].reverse() // use stack as queue
        const newRules: CFGRule[] = []
        let lastSuffix = ""
        while (rhsTemp.length > 2) {
            const nextSuffix = `_extra${rulesIdx},${symbol_idx}`
            const ch = rhsTemp.pop()!

            newRules.push({
                lhs: long.lhs + lastSuffix,
                rhs: [ch, long.lhs + nextSuffix],
            })

            lastSuffix = nextSuffix
        }

        newRules.push({
            lhs: long.lhs + lastSuffix,
            rhs: rhsTemp.reverse(),
        })

        return newRules
    })

    return [...shortenedRules, ...alrightRules]
}

function replaceNonterminals(rules: CFGRule[]) {
    const nonTerminalRules = new Set<CFGRule>()
    const ensureNonterminal = (ch: string) => {
        if (isNonterminal(ch)) {
            return ch
        }
        const nonterm = `U_literal,${ch}`
        nonTerminalRules.add({ lhs: nonterm, rhs: [ch] })
        return nonterm
    }

    const finalRules: CFGRule[] = rules.map(({ lhs, rhs }) => ({
        lhs,
        rhs: rhs.length === 1 ? rhs : rhs.map((ch) => ensureNonterminal(ch)),
    }))

    return [...finalRules, ...nonTerminalRules]
}

export function convertToCNF(cfg: CFG): CFG {
    let { rules, startSymbol } = newStartSymbol(cfg)
    rules = removeOneLengthRules(rules)
    rules = removeBlankRHS(rules, startSymbol)
    rules = removeLongRules(rules)
    rules = replaceNonterminals(rules)
    return new CFG(startSymbol, rules)
}
