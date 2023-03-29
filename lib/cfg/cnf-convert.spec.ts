import { CFG, isNonterminal } from "../cfg"
import { convertToCNF } from "./cnf-convert"
import { isEqual, partition } from "lodash"

function naiveGenerates(cfg: CFG, s: string): boolean {
    if (s.length === 0) {
        return cfg.rules.some((r) =>
            isEqual(r, { lhs: cfg.startSymbol, rhs: [] })
        )
    }
    let derivations = [[cfg.startSymbol]]
    const n = s.length

    const nonTerminalRules = cfg.rules.filter((r) => r.rhs.length === 2)

    for (let l = 2; l <= n; l++) {
        const newDerivations = []
        for (const prev of derivations) {
            for (let i = 0; i < prev.length; i++) {
                const r = nonTerminalRules.filter(({ lhs }) => lhs === prev[i])

                for (const rule of r) {
                    const newDeriv = prev
                        .slice(0, i)
                        .concat(rule.rhs, prev.slice(i + 1))
                    newDerivations.push(newDeriv)
                }
            }
        }
        derivations = newDerivations
    }

    // now derivations has a list of length n strings
    const terminalRules = cfg.rules.filter(({ rhs }) => rhs.length === 1)

    return derivations.some((poss) =>
        poss.every((nonterm, i) =>
            terminalRules.some((r) => isEqual(r, { lhs: nonterm, rhs: [s[i]] }))
        )
    )
}

describe("CNF Conversion tests", () => {
    // odd number of ones or even number of zeros
    let originalGrammar: CFG
    let cnf: CFG
    beforeEach(() => {
        originalGrammar = new CFG("S", [
            { lhs: "S", rhs: ["A"] },
            { lhs: "S", rhs: ["B"] },
            { lhs: "A", rhs: ["1", "A", "1"] },
            { lhs: "A", rhs: ["1"] },
            { lhs: "B", rhs: ["0", "B", "0"] },
            { lhs: "B", rhs: [] },
        ])
        cnf = convertToCNF(originalGrammar)
    })

    it("should have start symbol going to empty", () => {
        expect(cnf.rules).toContainEqual({ lhs: cnf.startSymbol, rhs: [] })
    })

    it("should only have start symbol go to empty", () => {
        expect(
            cnf.rules.every(
                (r) => r.rhs.length > 0 || r.lhs === cnf.startSymbol
            )
        )
    })

    it("should have every rule have length at most 2", () => {
        expect(cnf.rules.every((r) => r.rhs.length <= 2)).toBeTruthy()
    })

    test("one length rules should be terminals", () => {
        expect(
            cnf.rules.every(
                (r) => r.rhs.length !== 1 || !isNonterminal(r.rhs[0])
            )
        )
    })

    test("two length rules should all be nonterminals", () => {
        expect(
            cnf.rules.every(
                (r) =>
                    r.rhs.length !== 2 || r.rhs.every((ch) => isNonterminal(ch))
            )
        )
    })

    test("generates blank", () => {
        expect(naiveGenerates(cnf, "")).toBeTruthy()
    })
    test("generates odd ones", () => {
        expect(naiveGenerates(cnf, "111")).toBeTruthy()
    })

    test("generates even zeros", () => {
        expect(naiveGenerates(cnf, "00")).toBeTruthy()
    })
    test.each(["101", "110011", "1111"])(
        "does not generate incorrect strings (%p)",
        (s) => {
            expect(naiveGenerates(cnf, s)).toBeFalsy()
        }
    )
})
