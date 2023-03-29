import { CFG } from "./cfg"

describe("CYK Tests", () => {
    // odd 1s or even 0s
    let cfg: CFG
    beforeEach(() => {
        cfg = new CFG("S", [
            { lhs: "S", rhs: ["A"] },
            { lhs: "S", rhs: ["B"] },
            { lhs: "A", rhs: ["1", "A", "1"] },
            { lhs: "A", rhs: ["1"] },
            { lhs: "B", rhs: ["0", "B", "0"] },
            { lhs: "B", rhs: [] },
        ])
    })

    it.each(["", "111", "11111", "00", "000000"])("should generate %p", (s) => {
        expect(cfg.generates(s)).toBeTruthy()
    })

    it.each(["1010101", "0", "1111"])("should not generate %p", (s) => {
        expect(cfg.generates(s)).toBeFalsy()
    })
})
