# html-template-tag-cached

[html-template-tag](https://github.com/AntonioVdlC/html-template-tag) 5.0.0's
protections at 4.0.1's speed.

5.0.0 adds quotes to unquoted attribute values and drops values interpolated
into URI attributes (`href`, `src`, `style`...). It does this by checking the
text before every `${}` against every HTML attribute name, on every call. That
costs about 20 ms of script time per 1,000 rows in html-action.

None of those decisions depend on the values, only on the template's text. A
tagged template gets the same strings array every time it runs from the same
place in the code, so this version works the decisions out on a template's
first call, keeps them in a `WeakMap` keyed on that array, and every later call
only joins strings and escapes values.

```sh
npm install
npm test   # checks against 5.0.0, then times both
```

On html-action's row template, building 10,000 rows takes 2.7 ms here against
about 170 ms with 5.0.0 (Node, best of 5).

## Differences from 5.0.0

- **A `${}` is an attribute value only inside a tag.** The template's text is
  scanned for tags, quotes and comments, so `<p>width=${5}</p>` stays text
  instead of becoming `width="5"`, and `href=` in text or a comment isn't
  dropped. 5.0.0 also counts values already inserted; here only the
  template's text decides.
- **Any attribute name counts.** 5.0.0 only knows the names listed in
  `html-element-attributes`, so `_click=${x}` stayed unquoted. That dependency
  is gone, which also saves its 1.6 KB.
- **Single-quoted and upper-case URI attributes are blocked too**
  (`href='${x}'`, `HREF=${x}`). 5.0.0 lets both through.
- **The URI-attribute warning appears once per template**, not on every call.
- **`$${array}` drops the `$`**, like any other `$${}`. 5.0.0 leaves the `$` in
  the output.

As in 5.0.0, event-handler attributes (`onclick=${x}`) aren't blocked; the
value is escaped, which keeps it inside the attribute but doesn't make it safe
to run. A `<` inside `<script>` or `<style>` can be mistaken for a tag.
