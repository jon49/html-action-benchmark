// node test.mjs — checks html-template-tag-cached against html-template-tag
// 5.0.0, then times both on html-action's row template.
import assert from "node:assert/strict"
import original from "html-template-tag"
import cached from "./index.js"

let warn = console.warn
let warnings = 0
console.warn = () => warnings++
let failures = 0
function check(name, fn) {
    try { fn(); console.log("ok  ", name) }
    catch (e) { failures++; console.log("FAIL", name, "\n     ", e.message.split("\n").join("\n      ")) }
}

// Same output as 5.0.0. Each runs twice, so the second call uses the cached plan.
let same = [
    h => h`<p>Hello, ${"<b>Jon</b> & 'co'"}!</p>`,
    h => h`<p>${"<i>raw</i>"} and $${"<i>raw</i>"}</p>`,
    h => h`<ul>${["a", "b"].map(x => h`<li>${x}</li>`)}</ul>`,
    h => h`<td class=${"a onmouseover=alert(1)"}>x</td>`,
    h => h`<input value=${'say "hi"'} disabled=${"true"}>`,
    h => h`<a href="${"javascript:alert(1)"}">x</a>`,
    h => h`<a href=${"javascript:alert(1)"}>x</a>`,
    h => h`<a href="$${"/rows/1"}">x</a>`,
    h => h`<a href="/rows/${"1"}">x</a>`,
    h => h`<img src=$${"/a.png"} alt="${"a > b"}">`,
    h => h`<div style="${"color:red"}" data-id="${42}" title="${undefined}">`,
    h => h`<a class=${"x"} href=${"javascript:alert(1)"} title=${"t"}>x</a>`,
    h => h`<a title="a>b" class=${"x"}>x</a>`,
    h => h`${1}${2}${"<"}`,
    h => h`<${"a"} href=${"javascript:alert(1)"}>x</${"a"}>`,
]
for (let [i, c] of same.entries()) {
    check(`same as 5.0.0 #${i}: ${c(original)}`, () => {
        let expected = c(original)
        assert.equal(c(cached), expected)
        assert.equal(c(cached), expected)
    })
}

// Where it deliberately differs from 5.0.0.
let differs = [
    ["`name=` in text isn't an attribute",
        h => h`<p>width=${5} in text</p>`,
        `<p>width=5 in text</p>`],
    ["... nor after a `<` that doesn't start a tag",
        h => h`<p>a < b href=${"javascript:x"}</p>`,
        `<p>a < b href=javascript:x</p>`],
    ["... nor in a comment",
        h => h`<!-- href=${"x"} --><b class=${"y"}>`,
        `<!-- href=x --><b class="y">`],
    ["custom attributes get quotes",
        h => h`<tr data-id=${7}><a _click=${"select"}>`,
        `<tr data-id="7"><a _click="select">`],
    ["single-quoted URI attributes are blocked",
        h => h`<a href='${"javascript:alert(1)"}'>x</a>`,
        `<a href=''>x</a>`],
    ["URI attribute names are matched case-insensitively",
        h => h`<a HREF=${"javascript:alert(1)"}>x</a>`,
        `<a HREF="">x</a>`],
    ["`$${array}` drops the `$`",
        h => h`<ul>$${["<li>a</li>"]}</ul>`,
        `<ul><li>a</li></ul>`],
    ["... with several items, or none",
        h => h`<p>$${["<i>1</i>", "<i>2</i>"]} and $${[]}</p>`,
        `<p><i>1</i><i>2</i> and </p>`],
]
for (let [name, c, expected] of differs) {
    check(`${name}: ${expected} (5.0.0: ${c(original)})`, () => {
        assert.equal(c(cached), expected)
        assert.equal(c(cached), expected)
    })
}

// One warning per template, however many calls.
check("warns once per template", () => {
    warnings = 0
    let link = url => cached`<a href=${url}>x</a>`
    link("a"); link("b"); link("c")
    assert.equal(warnings, 1)
})
console.warn = warn
console.log(failures ? `${failures} failed` : "all passed")

// Timing: html-action's row template, 10k rows, best of 5.
let rows = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, label: "pretty red table" }))
for (let [name, h] of [["5.0.0", original], ["cached", cached]]) {
    let row = r => h`<tr><td class="col-md-1">${String(r.id)}</td><td class="col-md-4"><a _click="select">${r.label}</a></td><td class="col-md-1"><a _click="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td><td class="col-md-6"></td></tr>`
    let best = Infinity
    for (let k = 0; k < 5; k++) {
        let t = performance.now()
        h`${rows.map(row)}`
        best = Math.min(best, performance.now() - t)
    }
    console.log(`${name}: 10k rows in ${best.toFixed(1)} ms`)
}
process.exitCode = failures ? 1 : 0
