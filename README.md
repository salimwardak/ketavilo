# Ketavilo Library

Public site: https://salimwardak.github.io/ketavilo/

Edition 5. 78,325 Gutenberg text editions and 281 labelled Ganjoor collected-work entries from Ganjoor. Eight overlapping subject categories each contain more than 1,000 catalog entries.

1,012 distinct book summaries: 12 original summaries in Persian, Pashto and English, plus 1,000 source-attributed Wikipedia plot/content summaries. 153 summaries have Persian text; the remaining sourced summaries are in English, clearly labelled. Interface selection does not translate book or summary text. Wikipedia excerpts carry their revision links, contributor attribution, changes and CC BY-SA 4.0 notice in both the app and static pages.

The source text of contemporary books is not reproduced by the summary feature. Twelve classic complete texts retain Gutenberg notices and licenses. Other books and Ganjoor collections open or download at their original source. Listing a free source does not transfer its rights. Not every source download has been individually tested; 40 Ganjoor EPUB metadata files were checked, and the additional entries come from Ganjoor's official EPUB catalog. Of the 281 collections, 58 have a Persian language assignment; the remaining 223 are explicitly marked as language not recorded. This is not an exhaustive catalog of every free Persian book on the internet.

Owner signature: Salim Suliman

All acknowledgments below the owner signature were removed at the owner's request. Favorites, language, theme and reading progress are local to the browser. No account or cloud synchronization.

## Loading repair — version 6

The first page now contains 25 real book links and an embedded catalog seed (221 Gutenberg editions, 281 source collections and the complete index of 1,012 summaries). It does not wait for the old 9 MB catalog and 4 MB summaries file. The complete catalog loads in 32 small parts; summary text loads in 50-book parts only when opened. Failed requests preserve usable content and expose retry and static catalog links. Eight script-free category pages each list 1,000 real works.

The runtime repairs missing controls in old cached HTML and is compiled for ES2017. Versioned assets and the smaller service-worker cache avoid coupling page startup to a bulk cache download.

Development checks: `npm install`, then `npm test`. To rebuild runtime assets after source edits: `npm run build:runtime`. Tests simulate stalled downloads, failed requests, old cached HTML, retry recovery, all eight categories, source filters, three interface languages, summary loading and reading. The deployed app remains static; npm is needed only for development checks.



## Edition 9: actual text availability
13 complete hosted PDFs: 12 English books plus Hafez (695 poems from the complete Ganjoor EPUB, 615 PDF pages). The Readable filter defaults to 12 Gutenberg books plus 240 matching Ganjoor collections, including locally hosted Hafez. Other catalog entries are metadata only and have disabled reading controls. Source collection reading uses public JSON data; not all collection sections have been individually checked. Remote Gutenberg iframe embedding was rejected by Chromium and has been removed. All-title internal reading and all-title PDF hosting are NOT complete.
