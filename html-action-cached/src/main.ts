// HTML templates create rows. Every other action changes the rows already on
// the page, the way the timer's _action implementation does. The store and the
// <tr>s stay in the same order, so row i is tbody.rows[i].
import "./_action"
import { buildData, store } from "./store"
import { rowsView } from "./views"

let tbody = document.getElementById("tbody") as HTMLTableSectionElement
let selected: HTMLTableRowElement | null = null

let rowOf = (e: Event) => (e.target as Element).closest("tr") as HTMLTableRowElement
let labelOf = (tr: HTMLTableRowElement) => tr.cells[1].firstChild as HTMLAnchorElement

function replaceAll(count: number) {
    store.data = buildData(count)
    selected = null
    tbody.innerHTML = rowsView(store.data)
}

window.app = {
    run: () => replaceAll(1000),
    runLots: () => replaceAll(10000),

    add() {
        let rows = buildData(1000)
        store.data = store.data.concat(rows)
        tbody.insertAdjacentHTML("beforeend", rowsView(rows))
    },

    update() {
        let rows = tbody.rows
        for (let i = 0; i < store.data.length; i += 10) {
            let row = store.data[i]
            row.label += " !!!"
            labelOf(rows[i]).textContent = row.label
        }
    },

    clear() {
        store.data = []
        selected = null
        tbody.textContent = ""
    },

    swapRows() {
        let d = store.data
        if (d.length <= 998) return
        let a = d[1]
        d[1] = d[998]
        d[998] = a
        let x = tbody.rows[1], y = tbody.rows[998]
        let next = y.nextSibling
        x.replaceWith(y)
        next ? next.before(x) : tbody.append(x)
    },

    select(e) {
        let tr = rowOf(e)
        if (selected) selected.className = ""
        tr.className = "danger"
        selected = tr
    },

    remove(e) {
        let tr = rowOf(e)
        store.data.splice(tr.sectionRowIndex, 1)
        if (tr === selected) selected = null
        tr.remove()
    },
}
