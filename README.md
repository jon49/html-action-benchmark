# html-action-benchmark

Two [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark)
implementations, written to see how the approaches in
[jon49/timer](https://github.com/jon49/timer) hold up on a 1,000–10,000 row
table.

| Directory | Approach |
|---|---|
| [`morph-scoped/`](morph-scoped) | The timer's `morph-scoped-timer`, ported as-is: [html-template-tag-stream](https://github.com/jon49/html-template-tag-async) views, [idiomorph](https://github.com/bigskysoftware/idiomorph), and [@jon49/web](https://github.com/jon49/jon49-web)'s `_click` actions and `_action.lifecycle`. Every action renders only what it changed: one row's `<tr>`, or the whole table. |
| [`html-action/`](html-action) | [html-template-tag](https://github.com/AntonioVdlC/html-template-tag) 4.0.1 creates rows. Every other action changes the rows already on the page, through the timer's `_action` dispatcher (`src/_action.ts`, copied from the timer's `_action` implementation). No idiomorph, no @jon49/web. |

## Results

Measured 2026-11-24 with the benchmark's default runner (Puppeteer, headless
Chrome 156) on an Intel Core i5-1235U laptop. Times are in ms, median of 15
runs, with the share spent running JavaScript ("script time") in parentheses.
vanillajs and html-action (4.0.1) come from the same run; the other columns
come from earlier runs on the same machine.

| Benchmark | vanillajs | html-action (4.0.1) | html-action (5.0.0) | morph-scoped | vanjs | react-hooks |
|---|---|---|---|---|---|---|
| create 1k rows | 57.7 (4.0) | 63.0 (7.1) | 80.4 (26.3) | 73.8 (11.7) | 85.0 (16.9) | 79.7 (15.3) |
| replace 1k rows | 67.3 (9.8) | 66.9 (12.1) | 87.1 (29.6) | 81.1 (17.7) | 81.1 (21.2) | 86.6 (25.1) |
| update every 10th row | 32.2 (1.0) | 33.1 (1.3) | 31.9 (1.3) | 57.4 (24.4) | 54.7 (3.0) | 36.2 (8.2) |
| select row | 8.9 (0.8) | 8.0 (0.5) | 7.5 (0.4) | 12.0 (3.5) | 16.0 (0.9) | 14.7 (5.7) |
| swap rows | 34.8 (0.5) | 39.4 (0.9) | 34.4 (0.8) | 38.2 (1.2) | 38.7 (0.6) | 297.5 (44.8) |
| remove row | 39.1 (0.9) | 38.5 (0.3) | 33.1 (0.3) | 36.6 (0.9) | 45.4 (0.7) | 40.9 (3.0) |
| create 10k rows | 631.6 (36.6) | 699.2 (72.0) | 852.3 (230.5) | 761.0 (98.7) | 839.2 (152.6) | 880.1 (218.7) |
| append 1k rows | 92.6 (4.9) | 78.0 (8.7) | 97.4 (26.8) | 79.2 (10.3) | 96.2 (22.1) | 83.4 (15.6) |
| clear rows | 34.2 (29.2) | 32.1 (28.0) | 29.2 (25.2) | 35.7 (30.8) | 31.7 (27.4) | 49.6 (44.9) |
| memory after load, MB | 0.56 | 0.56 | 0.58 | 0.60 | 0.55 | 1.18 |
| memory with 1k rows, MB | 1.87 | 1.78 | 1.81 | 1.81 | 2.32 | 4.42 |
| memory after create + clear, MB | 0.64 | 0.69 | 0.71 | 0.73 | 0.70 | 1.97 |
| size, uncompressed, KB | 11.3 | 5.5 | 10.9 | 17.8 | 5.8 | 190.3 |
| size, compressed, KB | 2.5 | 1.9 | 3.5 | 5.7 | 2.0 | 51.4 |
| first paint, ms | 95.9 | 71.3 | 76.0 | 92.2 | 84.1 | 370.0 |

The raw result files are in [`results/`](results). The run against vanillajs-lite
below is in [`results/2026-11-25/`](results/2026-11-25).

Reading the numbers:

- **Script time** is the part of each measurement Chrome spent in
  JavaScript: event handlers, function calls, microtasks, timers. The rest is
  mostly style, layout and paint. DOM work done from inside a JavaScript call
  (like removing 1,000 rows) counts as script.
- The benchmark slows the CPU 4× for update, select, swap and clear, and 2×
  for remove.
- **Runs vary by 5–15 ms** on this machine. vanillajs itself measured 78 and
  93 ms for "append 1k rows" in two runs. Treat smaller differences as noise,
  and compare script time when the totals are close.
- With 1–2 ms of script on every operation that isn't creating rows,
  html-action is level with vanillajs. Creating rows costs a few ms more,
  from building an HTML string and parsing it instead of cloning a template.

## Weighted geometric mean, against vanillajs-lite

The benchmark's results page ranks frameworks by a weighted geometric mean of
the nine timing benchmarks. For each benchmark it divides a framework's median
by the fastest median in the set, then averages those ratios on a log scale,
weighted by benchmark (create 1k rows 0.64; update, create 10k, replace,
append and remove 0.53–0.56; clear 0.42; select 0.19; swap 0.13). 1.00 means
fastest on everything. The score depends on which frameworks are in the set.

These four ran together on 2026-11-25, same machine and setup as above:

| Benchmark | vanillajs-lite | vanillajs | html-action | morph-scoped |
|---|---|---|---|---|
| create 1k rows | 59.7 (3.6) | 58.8 (4.0) | 63.3 (7.0) | 67.9 (10.6) |
| replace 1k rows | 64.7 (9.0) | 67.7 (9.7) | 68.2 (12.6) | 75.5 (16.7) |
| update every 10th row | 30.7 (1.0) | 29.4 (1.0) | 30.6 (1.3) | 50.3 (20.1) |
| select row | 6.8 (0.4) | 7.6 (0.7) | 7.3 (0.2) | 10.6 (3.1) |
| swap rows | 33.4 (0.7) | 33.0 (0.7) | 36.0 (0.8) | 34.2 (1.0) |
| remove row | 34.9 (0.3) | 36.5 (0.7) | 34.0 (0.4) | 32.7 (0.7) |
| create 10k rows | 635.9 (32.0) | 648.8 (37.7) | 707.6 (69.2) | 719.3 (91.9) |
| append 1k rows | 68.3 (3.5) | 64.9 (3.7) | 68.7 (6.7) | 74.0 (9.0) |
| clear rows | 27.2 (23.4) | 26.9 (22.7) | 27.8 (23.8) | 30.7 (27.1) |
| **weighted geometric mean** | **1.03** | **1.03** | **1.06** | **1.20** |

- html-action is about 3% behind vanillajs-lite. Most of that is creating
  rows: about 37 ms more script for 10k rows, and 3–4 ms more per 1k, from
  building and parsing an HTML string. Everything else is within noise.
- morph-scoped's gap is mostly update every 10th row, where idiomorph costs
  about 20 ms of script.
- vanjs and react-hooks weren't rerun. In the earlier runs above they came out
  well behind vanillajs: scored as one set, vanillajs 1.05, vanjs 1.33,
  react-hooks 1.36.
- In this run, html-action's first create 10k rows measured 936 ms, with
  samples from 780 to 1,308 ms and doubled script time, while the other three
  stayed steady. That points to something else using the CPU at the time, so
  create 10k rows was rerun for all four. The table uses the rerun. Both are in
  [`results/2026-11-25/`](results/2026-11-25).

## How morph-scoped got here

The first port had two slow spots. Both are fixed in `morph-scoped/`:

| Benchmark | first port | now |
|---|---|---|
| replace 1k rows | 504.5 (439.6) | 81.1 (17.7) |
| update every 10th row | 72.0 (44.6) | 57.4 (24.4) |
| create 10k rows | 820.2 (145.5) | 761.0 (98.7) |
| clear rows | 46.4 (41.8) | 35.7 (30.8) |

- **Replace** morphed 1,000 old rows into 1,000 rows with new ids. Nothing
  matches, but idiomorph keeps looking, and that grows with old × new rows.
  `renderRows` now sets `innerHTML` when none of the new rows is on the page.
- **Update** ran 100 separate renders, each streaming, parsing and searching
  the row list. It now renders and parses the 100 rows once, then morphs each
  `<tr>`.

What's left in update is idiomorph itself. A CPU profile of the update
(no throttling) put about 3.7 of 6 ms in idiomorph, comparing attributes and
children to find the 100 text nodes the action already knew had changed. The
rows here hold no state worth preserving. In the timer, idiomorph is what
keeps the input being typed in, the focused button, the open dialog and the
`_load` countdowns alive across renders, so it earns its place there.

## Choosing the template library for html-action

Same `_action` code, three template libraries:

| Benchmark | html-template-tag-stream 5.0.0 | html-template-tag 5.0.0 | html-template-tag 4.0.1 |
|---|---|---|---|
| create 1k rows | 60.7 (7.1) | 80.4 (26.3) | 63.0 (7.1) |
| replace 1k rows | 68.3 (12.3) | 87.1 (29.6) | 66.9 (12.1) |
| create 10k rows | 643.9 (63.1) | 852.3 (230.5) | 699.2 (72.0) |
| append 1k rows | 66.2 (6.4) | 97.4 (26.8) | 78.0 (8.7) |
| size, compressed, KB | 2.4 | 3.5 | 1.9 |

- The stream library and html-template-tag 4.0.1 cost the same script time.
  The stream library's `await`s only wait on microtasks, which is nothing next
  to building and parsing the HTML. 4.0.1 wins on size and simpler code.
- html-template-tag 4.1.0 and later check the text before every `${}` against
  every HTML attribute name in `html-element-attributes`, to add missing quotes
  and to block interpolation in URI attributes (`href`, `src`, `style`...).
  That costs about 20 ms per 1,000 rows here, and 1.6 KB.
- **4.0.1 doesn't block `javascript:` URLs interpolated into `href` or `src`.**
  The row template has no URI attributes, so this doesn't matter here. Keep it
  in mind anywhere user input lands in one.

Raw results weren't kept for the first morph-scoped port or the stream-library
run of html-action. Their numbers above are the medians recorded at the time.

## Running them

1. Clone [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark)
   and copy `morph-scoped/` and `html-action/` into its `frameworks/keyed/`.
2. `morph-scoped` needs [jon49-web](https://github.com/jon49/jon49-web)
   checked out next to the benchmark repo (`@jon49/web` is a `file:`
   dependency, because the npm release predates `_action.lifecycle`).
   `html-action` has no such requirement.
3. Build each one: `npm install && npm run build-prod` in its directory.
4. From the benchmark repo's root:

   ```sh
   npm ci --legacy-peer-deps   # plain `npm ci` fails on an eslint peer conflict
   npm run install-local
   npm start                   # serves on :8080; leave it running
   ```

5. In another terminal:

   ```sh
   cd webdriver-ts
   npm run isKeyed -- --headless true keyed/html-action
   npm run bench -- --headless true --framework keyed/html-action keyed/vanillajs
   ```

   Results land in `webdriver-ts/results/`. A full run of one framework takes
   about 7 minutes. Keep the machine awake: a suspend in the middle of a
   measurement spoils it.

The row data generator in each `src/store.ts` is the one from the benchmark's
`vanillajs` implementation.
