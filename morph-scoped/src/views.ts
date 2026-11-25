import html from "html-template-tag-stream"
import { store, type Row } from "./store"

let when = (b: unknown, s: string) => b ? s : ""

export function rowsView(rows: Row[] = store.data) {
    return html`${rows.map(row => rowView(row))}`
}

// The <tr> keeps a stable id so idiomorph matches it, like a timer's <article>.
export function rowView(row: Row) {
    return html`<tr id="row-${row.id}"$${when(row.id === store.selected, ` class="danger"`)}><td class="col-md-1">${row.id}</td><td class="col-md-4"><a data-id="${row.id}" _click="select">${row.label}</a></td><td class="col-md-1"><a data-id="${row.id}" _click="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td><td class="col-md-6"></td></tr>`
}
