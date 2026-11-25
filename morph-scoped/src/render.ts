/// <reference path="../node_modules/@jon49/web/lib/idiomorph.d.ts" />
// Same render pipeline as morph-scoped-timer's render.ts: views stream HTML,
// renders run one after another, and each touches only what changed.
import { Idiomorph } from "idiomorph"
import { rowsView } from "./views"
import { store, type Row } from "./store"

type Html = AsyncGenerator<string, void, unknown>

let rendering = Promise.resolve()

async function text(view: Html) {
    let s = ""
    for await (let x of view) s += x
    return s
}

function run(work: () => Promise<void> | void) {
    rendering = rendering.then(async () => {
        await work()
        document.dispatchEvent(new CustomEvent("hz:completed"))
    }).catch(x => console.error(x))
}

function morph(target: Element | null, html: string | Element, morphStyle: "outerHTML" | "innerHTML") {
    if (!target) return
    Idiomorph.morph(target, html, { morphStyle })
}

let $ = (id: string) => document.getElementById(id)

// Every row (create, replace, clear). When none of the new rows is on the page
// there is nothing for idiomorph to match, so skip it: its search for matches
// grows with old rows × new rows.
export function renderRows() {
    run(async () => {
        let tbody = $("tbody")
        if (!tbody) return
        let html = await text(rowsView())
        let kept = store.data.some(row => $(`row-${row.id}`))
        if (kept) morph(tbody, html, "innerHTML")
        else tbody.innerHTML = html
    })
}

// The given rows' <tr>s, and nothing else. They render and parse together,
// then each is morphed into its own <tr>.
export function renderRow(...ids: number[]) {
    run(async () => {
        let wanted = new Set(ids)
        let rows = store.data.filter(row => wanted.has(row.id))
        let template = document.createElement("template")
        template.innerHTML = `<table><tbody>${await text(rowsView(rows))}</tbody></table>`
        for (let tr of Array.from(template.content.querySelectorAll("tr"))) {
            morph($(tr.id), tr, "outerHTML")
        }
    })
}

// New rows, added after the others.
export function appendRows(rows: Row[]) {
    run(async () => $("tbody")?.insertAdjacentHTML("beforeend", await text(rowsView(rows))))
}

// A deleted row's <tr> leaves the page.
export function dropRow(id: number) {
    run(() => $(`row-${id}`)?.remove())
}

// Two rows trade places: move the existing <tr>s.
export function swapRows(a: number, b: number) {
    run(() => {
        let x = $(`row-${a}`), y = $(`row-${b}`)
        if (!x || !y) return
        let next = y.nextSibling
        x.replaceWith(y)
        next ? next.before(x) : y.parentNode?.append(x)
    })
}
