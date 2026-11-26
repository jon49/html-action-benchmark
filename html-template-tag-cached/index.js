// html-template-tag 5.0.0's protections, decided once per template instead of
// on every call.
//
// A tagged template is handed the same strings array on every call from the
// same place in the code. Whether a `${}` needs quotes, must be dropped, or is
// marked raw with `$${}` depends only on that array, never on the values, so
// the first call works it out and every later call only joins strings.
//
// Differences from 5.0.0:
// - Only the template's own text decides. A `${}` is treated as an attribute
//   value only when it is inside a tag, so `<p>width=${5}</p>` stays text.
// - Any attribute name counts, not just the ones listed in
//   html-element-attributes, so `data-id=${x}` and `_click=${x}` get quotes
//   too, and that dependency is gone.
// - Single-quoted URI attributes (`href='${x}'`) are blocked as well.
// - The URI-attribute warning is printed once per template, not on every call.
// - `$${array}` drops the `$` like any other `$${}`.
import escape from "html-es6cape"

let uriAttributes = new Set(["action", "archive", "background", "cite", "classid", "codebase", "content", "data", "dynsrc", "formaction", "href", "icon", "imagesrcset", "longdesc", "lowsrc", "manifest", "nohref", "onload", "poster", "popovertargetaction", "profile", "src", "srcset", "style", "usemap"])

// Where the end of a literal falls in the HTML: in text, inside a tag between
// attributes, inside a quoted attribute value, or in a comment.
const TEXT = 0, TAG = 1, DOUBLE = 2, SINGLE = 3, COMMENT = 4

function scan(state, text) {
    for (let i = 0; i < text.length; i++) {
        let c = text[i]
        if (state === TEXT) {
            if (text.startsWith("<!--", i)) { state = COMMENT; i += 3 }
            // A `<` that ends a literal is followed by a `${}` tag name.
            else if (c === "<" && /^[a-zA-Z\/]?$/.test(text[i + 1] ?? "")) state = TAG
        }
        else if (state === TAG) {
            if (c === '"') state = DOUBLE
            else if (c === "'") state = SINGLE
            else if (c === ">") state = TEXT
        }
        else if (state === DOUBLE) { if (c === '"') state = TAG }
        else if (state === SINGLE) { if (c === "'") state = TAG }
        else if (text.startsWith("-->", i)) { state = TEXT; i += 2 }
    }
    return state
}

// The attribute a literal ends inside: `name=` (unquoted) or `name="` / `name='`.
let unquotedRe = /([^\s"'<>\/=]+)=$/
let quotedRe = /([^\s"'<>\/=]+)=["']$/

let plans = new WeakMap()

function plan(strings) {
    let raw = strings.raw
    let n = raw.length - 1
    let literals = [...raw]
    let unescaped = []   // `$${…}`: insert as-is
    let dropped = []     // the start of a URI attribute's value: insert nothing
    let state = TEXT
    for (let k = 0; k < n; k++) {
        unescaped[k] = raw[k].endsWith("$")
        if (unescaped[k]) literals[k] = literals[k].slice(0, -1)
        state = scan(state, literals[k])
        let name
        if (state === TAG && (name = literals[k].match(unquotedRe)?.[1])) {
            // An unquoted attribute value: wrap it in quotes.
            literals[k] += '"'
            literals[k + 1] = '"' + literals[k + 1]
            state = DOUBLE  // the next literal starts by closing that quote
        }
        else if (state === DOUBLE || state === SINGLE) name = literals[k].match(quotedRe)?.[1]
        dropped[k] = !unescaped[k] && name !== undefined && uriAttributes.has(name.toLowerCase())
        if (dropped[k]) {
            console.warn("[html-template-tag] Trying to interpolate inside an URI attribute. This can lead to security vulnerabilities. The interpolation has been removed. If you are sure you want to interpolate inside an URI attribute, please escape this interpolation with an extra '$' sign in front of it.", { literal: raw[k] })
        }
    }
    let p = { literals, unescaped, dropped }
    plans.set(strings, p)
    return p
}

export default function html(strings, ...values) {
    let { literals, unescaped, dropped } = plans.get(strings) ?? plan(strings)
    let out = literals[0]
    for (let k = 0; k < values.length; k++) {
        let v = values[k]
        if (!dropped[k]) out += Array.isArray(v) ? v.join("") : unescaped[k] ? v : escape(v)
        out += literals[k + 1]
    }
    return out
}
