const { normalizeURL } = require("./crawl");
const { test, expect } = require("@jest/globals");

test("normalizeURL >  Strip Protocol", () => {
    expect(normalizeURL("https://example.com")).toBe("example.com");
    expect(normalizeURL("http://example.com")).toBe("example.com");
    expect(normalizeURL("ftp://example.com")).toBe("example.com");
    expect(normalizeURL("rdp://example.com")).toBe("example.com");
});

test("normalizeURL >  Trailing Slash", () => {
    expect(normalizeURL("https://example.com/")).toBe("example.com");
    expect(normalizeURL("https://example.com/test/")).toBe("example.com/test");
});

test("normalizeURL >  Capitals", () => {
    expect(normalizeURL("https://Example.com")).toBe("example.com");
    expect(normalizeURL("https://exAMple.cOm")).toBe("example.com");
    expect(normalizeURL("https://exAMple.cOm/TeSt")).toBe("example.com/TeSt"); // don't lowercase path
});