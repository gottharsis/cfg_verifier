import { isEqual, isUndefined, partition } from "lodash"
import { convertToCNF } from "./cfg/cnf-convert"

export interface CFGRule {
    lhs: string
    rhs: string[]
}

export function isNonterminal(symbol: string): boolean {
    return /^[A-Z](_[a-zA-Z0-9,.]*)*/.test(symbol)
}

export class CFG {
    private _cnfForm: CFG | undefined
    constructor(readonly startSymbol: string, readonly rules: CFGRule[]) {}

    /**
     * Use CYK Algorithm to determine if string can be generated
     */
    public generates(target: string): boolean {
        const cnf = this.cnfForm
        if (target.length === 0) {
            return cnf.rules.some((r) => r.rhs.length === 0)
        }
        const nonterminals = cnf.getNonterminals()
        const n = target.length

        // dp[l][start] = set of all symbols that can generate target[start:start+l]
        const dp: string[][][] = Array.from(
            { length: n + 1 },

            (_) => Array.from({ length: n }, (_) => new Array())
        )
        const [terminalRules, nonterminalRules] = partition(
            cnf.rules,
            (r) => r.rhs.length < 2
        )

        const targetChars = Array.from(target)

        // length 0
        dp[1] = targetChars.map((ch) =>
            terminalRules.filter((r) => r.rhs.includes(ch)).map((r) => r.lhs)
        )

        for (let l = 2; l <= n; l++) {
            for (let start = 0; start + l <= n; start++) {
                for (let split = 1; split < l; split++) {
                    const left = dp[split][start]
                    const right = dp[l - split][start + split]
                    for (const leftSymbol of left) {
                        for (const rightSymbol of right) {
                            dp[l][start].push.apply(
                                dp[l][start],
                                nonterminalRules
                                    .filter((r) =>
                                        isEqual(r.rhs, [
                                            leftSymbol,
                                            rightSymbol,
                                        ])
                                    )
                                    .map((r) => r.lhs)
                            )
                        }
                    }
                }
            }
        }

        console.log("DP")
        console.dir(dp, { depth: 4 })

        return dp[n][0].includes(cnf.startSymbol)
    }

    public getNonterminals() {
        return [...new Set(this.rules.map((i) => i.lhs))]
    }

    get cnfForm() {
        if (isUndefined(this._cnfForm)) {
            this._cnfForm = convertToCNF(this)
        }
        return this._cnfForm
    }
}
