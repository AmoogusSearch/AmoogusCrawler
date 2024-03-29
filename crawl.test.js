const { normalizeURL, getURLsFromHTML } = require("./crawl");
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

test("getURLsFromHTML >  Absolute", () => {
    expect(
        getURLsFromHTML(
            `<html>
        <body>
            <a href="https://blog.example.com/path/">Link</a>
        </body>
    </html>`,
            "https://blog.example.com"
        )
    ).toEqual(["https://blog.example.com/path/"]);
});

test("getURLsFromHTML >  Relative", () => {
    expect(
        getURLsFromHTML(
            `<html>
        <body>
            <a href="/path/">Link</a>
        </body>
    </html>`,
            "https://blog.example.com"
        )
    ).toEqual(["https://blog.example.com/path/"]);
});


test("getURLsFromHTML >  Relative & Absolute", () => {
    expect(
        getURLsFromHTML(
            `<html>
        <body>
            <a href="/path1/">Link</a>
            <a href="https://blog.example.com/path2/">Link</a>
        </body>
    </html>`,
            "https://blog.example.com"
        )
    ).toEqual(["https://blog.example.com/path1/", "https://blog.example.com/path2/"]);
});

test("getURLsFromHTML >  Nested", () => {
    expect(
        getURLsFromHTML(
            `<html>
        <body>
            
            <div>
                <a href="https://blog.example.com/path1/">Link</a>
                <div>
                    <p>
                        <a href="/path2/">Link</a>
                    </p>
                </div>
            </div>
        </body>
    </html>`,
            "https://blog.example.com"
        )
    ).toEqual(["https://blog.example.com/path1/", "https://blog.example.com/path2/"]);
});

test("getURLsFromHTML >  Invalid", () => {
    expect(
        getURLsFromHTML(
            `<html>
        <body>
            <a href="invalid">Link</a>
            <a href="::#//invalid/x">Link</a>
        </body>
    </html>`,
            "https://blog.example.com"
        )
    ).toEqual([]);
});