// The rows and which one is selected. Same data as vanillajs's Store.
export type Row = { id: number, label: string }

let adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"]
let colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"]
let nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"]

let random = (max: number) => Math.round(Math.random() * 1000) % max
let nextId = 1

export let store = {
    data: [] as Row[],
    selected: 0,
}

export function buildData(count: number): Row[] {
    let data: Row[] = new Array(count)
    for (let i = 0; i < count; i++) {
        data[i] = {
            id: nextId++,
            label: `${adjectives[random(adjectives.length)]} ${colours[random(colours.length)]} ${nouns[random(nouns.length)]}`,
        }
    }
    return data
}
