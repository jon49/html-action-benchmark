// What the timer's `_action` dispatcher looks up: an `app` on the element, on
// its `[data-root]`, or on `window`.
interface Element {
    app?: Record<string, (ev: Event) => void>
}

interface Window {
    dataAction: (e: Event) => void
    app: Record<string, (ev: Event) => void>
}
