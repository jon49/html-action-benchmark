import html from "html-template-tag"
import type { Row } from "./store"

// New rows only. Once a row is on the page, actions change it directly.
// html-template-tag joins arrays without escaping them, so nested rows are safe.
export function rowsView(rows: Row[]) {
    return html`${rows.map(row => rowView(row))}`
}

function rowView(row: Row) {
    return html`<tr><td class="col-md-1">${String(row.id)}</td><td class="col-md-4"><a _click="select">${row.label}</a></td><td class="col-md-1"><a _click="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td><td class="col-md-6"></td></tr>`
}
