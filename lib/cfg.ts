import { partition } from "lodash"
export interface CFGRule {
    lhs: string
    rhs: string[]
}

export function isNonterminal(symbol: string): boolean {
    return /^[A-Z](_[a-zA-Z0-9,.]*)*/.test(symbol)
}

export class CFG {
    private cnfForm: CFG | undefined
    constructor(readonly startSymbol: string, readonly rules: CFGRule[]) {}

    /**
     * Return a new grammar that is in CNF
     */
    private convertToCNF() {
        if (this.cnfForm) {
            return
        }
    }
}
