const { test, expect } = require("@jest/globals");
const { calculateResults } = require("./calculate");

test("calculateResults", () => {
    expect(
        calculateResults({layers: [
            {
                url: "https://example.com",
                count: 1,
                children: [
                    { url: "https://example.com/1", count: 1, children: [] },
                ],
            },
        ]})
    ).toEqual({
        "https://example.com": 1,
        "https://example.com/1": 1,
    });
});
