// The `_click` actions the markup names, registered on `window.app` for
// @jon49/web's dispatcher. Each changes state, then renders only what it touched.
import type { AppActionContext } from "@jon49/web/app-actions.js"
import { appendRows, dropRow, renderRow, renderRows, swapRows } from "./render"
import { buildData, store } from "./store"

// The dispatcher hands over the clicked element (maybe the remove icon's
// <span>), not the one with `_click`, so look up from there.
let idOf = (el: HTMLElement) => +(el.closest<HTMLElement>("[data-id]")?.dataset.id ?? 0)

export let actions = {
    run() {
        store.data = buildData(1000)
        store.selected = 0
        renderRows()
    },

    runLots() {
        store.data = buildData(10000)
        store.selected = 0
        renderRows()
    },

    add() {
        let rows = buildData(1000)
        store.data = store.data.concat(rows)
        appendRows(rows)
    },

    update() {
        let ids: number[] = []
        for (let i = 0; i < store.data.length; i += 10) {
            let row = store.data[i]
            row.label += " !!!"
            ids.push(row.id)
        }
        renderRow(...ids)
    },

    clear() {
        store.data = []
        store.selected = 0
        renderRows()
    },

    swapRows() {
        let d = store.data
        if (d.length <= 998) return
        let a = d[1]
        d[1] = d[998]
        d[998] = a
        swapRows(d[998].id, d[1].id)
    },

    select({ el }: AppActionContext) {
        let previous = store.selected
        store.selected = idOf(el)
        renderRow(previous, store.selected)
    },

    remove({ el }: AppActionContext) {
        let id = idOf(el)
        store.data = store.data.filter(x => x.id !== id)
        dropRow(id)
    },
}
