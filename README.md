# cbmed
An online editor for Commodore BASIC programs supporting annotation

## Editor Key Mappings

### Cursor Movement

| Action | Key Sequence |
+--------+--------------+
| Move cursor up one line | `UpArrow` or `control`+`H` |
| Move cursor down one line | `DownArrow` or `control`+`N` |
| Move cursor left one character | `LeftArrow` or `control`+`B` |
| Move cursor right one character | `RightArrow` or `control`+`M` |
| Move cursor up one page | `PageUp` (mac: `fn`+`UpArrow`) |
| Move cursor down one page | `PageDown` (mac: `fn`+`DownArrow`) |
| Move cursor to start of line | `meta`+`LeftArrow` or `control`+`A` or `Home` |
| Move cursor to end of line | `meta`+`RightArrow` or `control`+`E` or `End` |
| Move cursor to start of current or previous word | `alt`+`LeftArrow` |
| Move cursor to end of current or next word | `alt`+`RightArrow` |
| Move cursor to start of document | `meta`+`UpArrow` or `control`+`Home` |
| Move cursor to end of document | `meta`+`DownArrow` or `control`+`End` |
| Move cursor to paired bracket | `meta`+`[` |
| Undo last cursor move | `meta`+`U` |
| Redo last cursor move | `shift`+`meta`+`U` |
| Scroll line up | `control`+`UpArrow` |
| Scroll line down | `control`+`DownArrow` |
| Scroll page up | `shift`+`control`+`PageUp` or `meta`+`PageUp` (mac: `meta`+`fn`+`UpArrow`) |
| Scroll page down | `shift`+`control`+`PageDown` or `meta`+`PageDown` (mac: `meta`+`fn`+`DownArrow`) |

### Selection

| Action | Key Sequence |
+--------+--------------+
| Move cursor up one line and extend selection to cursor | `shift`+`UpArrow` or `shift`+`control`+`H` |
| Move cursor down one line and extend selection to cursor | `shift`+`DownArrow` or `shift`+`control`+`N` |
| Move cursor left one character and extend selection to cursor | `shift`+`LeftArrow` or `shift`+`control`+`B` |
| Move cursor right one character and extend selection to cursor | `shift`+`RightArrow` or `shift`+`control`+`M` |
| Move cursor up one page and extend selection to cursor | `shift`+`PageUp` (mac `shift`+`fn`+`DownArrow`) |
| Move cursor down one page and extend selection to cursor | `shift`+`PageDown` (mac `shift`+`fn`+`RightArrow`) |
| Move cursor to start of line and extend selection to cursor | `shift`+`meta`+`LeftArrow` or `shift`+`control`+`A` or `shift`+`Home` |
| Move cursor to end of line and extend selection to cursor | `shift`+`meta`+`RightArrow` or `shift`+`control`+`E` or `shift`+`End` | 
| Move cursor to start of current or previous word and extend selection to cursor | `shift`+`alt`+`LeftArrow` |
| Move cursor to end of current or next word and extend selection to cursor | `shift`+`alt`+`RightArrow` |
| Move cursor to start of document and extend selection to cursor | `shift`+`meta`+`UpArrow` or `shift`+`control`+`Home` |
| Move cursor to end of document and extend selection to cursor | `shift`+`meta`+`DownArrow` or `shift`+`control`+`End` |
| Move cursor to paired bracket and extend selection to cursor | `shift`+`meta`+`[` |
| Expand selection to full current line or next line | `shift`+`meta`+`L` |
| "Smart" contract selection | `shift`+`control`+`LeftArrow` |
| "Smart" expand selection | `shift`+`control`+`RightArrow` |
| Select all | `meta`+`A` |
| Cancel current selection | `Escape` _if any selection_ |

### Column Selection/Multi-Cursor

| Action | Key Sequence |
+--------+--------------+
| Extend column selection down | `shift`+`alt`+`meta`+`DownArrow` |
| Extend column selection up | `shift`+`alt`+`meta`+`UpArrow` |
| Extend column selection left | `shift`+`alt`+`meta`+`LeftArrow` |
| Extend column selection right | `shift`+`alt`+`meta`+`RightArrow` |
| Extend column selection up one page | `shift`+`alt`+`meta`+`PageUp` (mac: `shift`+`alt`+`meta`+`fn`+`UpArrow` ) |
| Extend column selection down one page | `shift`+`alt`+`meta`+`PageDown` (mac: `shift`+`alt`+`meta`+`fn`+`DownArrow` ) |
| Add cursor above | `shift`+`alt`+`meta`+`;` |
| Add cursor below | `alt`+`meta`+`;` |
| Add cursors to end of all selected lines | `alt`+`meta`+`I` |
| Cancel column select | `Escape` _if no selection and multi-cursor_ |

### Deletion

| Action | Key Sequence |
+--------+--------------+
| Delete character to left of cursor | `Backspace` (mac: `delete`) |
| Delete character to right of cursor | `Delete` (mac: `fn`+`delete`) |
| Delete to start of line | `meta`+`Backspace` |
| Delete to end of line | `meta`+`Delete` (mac: `meta`+`fn`+`delete`) |
| Delete word to left | `shift`+`meta`+`,` |
| Delete word to right | `shift`+`meta`+`.` |
| Delete current or all selected lines | `shift`+`meta`+`K` |
| Delete trailing whitespace |  `shift`+`meta`+`J` |
| Delete current brackets | `alt`+`meta`+`Backspace` |

### Editing

| Action | Key Sequence |
+--------+--------------+
| Accept and process current line | `Enter` _at end of line_ |
| Split current line and process first part | `Enter` _anywhere but end of line_ |
| Accept and process current line | `shift`+`Enter` _anywhere in line_ |
| Indent current or all selected lines | `Tab` or `meta`+`]` |
| Outdent current or all selected lines | `shift`+`Tab` or `shift`+`meta`+`]` |
| Copy current selection to clipboard | `control`+`C` or `meta`+`C` or `control`+`Insert` |
| Cut current selection to clipboard | `control`+`X` or `meta`+`X` |
| Paste clipboard at cursor or replacing current selection | `control`+`V` or or `meta`+`V` or `shift`+`Insert` |
| Join highlighted lines | `control`+`J` |
| Transpose current letter with previous and advance cursor | `control`+`T` |
| Move current or all selected lines down | `alt`+`DownArrow` |
| Move current or all selected lines up | `alt`+`UpArrow` |
| Move selected text (within a single line) left | `meta`+`,` |
| Move selected text (within a single line) right | `meta`+`.` |
| Duplicate current line above | `shift`+`alt`+`UpArrow` |
| Duplicate current line below | `shift`+`alt`+`DownArrow` |
| Insert blank line above | `shift`+`meta`+`Enter` |
| Insert blank line below | `meta`+`Enter` |
| Convert current or all selected lines to comments | `meta`+`/` or `meta`+`` ` `` |
| Uncomment current or all selected lines | `shift`+`meta`+`/` or `shift`+`meta`+`` ` `` |
| Undo last change | `meta`+`Z` |
| Redo last change | `shift`+`meta`+`Z` |

### Find and Replace

| Action | Key Sequence |
+--------+--------------+
| Open find panel | `meta`+`F` |
| Open find and replace panel | `alt`+`meta`+`'F` |
| Find current selection | `meta`+`E` |
| Assign selection as find pattern | `meta`+`D` |
| Go to previous match of find pattern | `shift`+`meta`+`G` |
| Go to next match of find pattern | `meta`+`G` |
| Highlight previous match of current word | `shift`+`meta`+`W` |
| Highlight next match of current word | `meta`+`W` |
| Toggle case sensitive find | `alt`+`meta`+`C` |
| Toggle find in selection or document | `alt`+`meta`+`L` |
| Toggle regex find pattern | `alt`+`meta`+`R` |
| Toggle whole word find | `alt`+`meta`+`W` |
| Go to line number | `control`+`G` |

### EDCBM Shortcuts

| Action | Key Sequence |
+--------+--------------+
| Open Machine menu | `control`+`Q` |
| Open Program menu | `control`+`P` |
| Open DISK menu | `control`+`D` |
| Toggle Virtual Keyboard | `control`+`K` |
| Swap character set | `control`+`L` |
| Show context menu | `meta`+`M` |
| Go to menu bar | `Escape` _if no selection or multi-cursor_ |
| Decrease font size | `alt`+`meta`+`-` |
| Increase font size | `shift`+`alt`+`meta`+`=` |
| Reset font size | `alt`+`meta`+`=` |

### PETSCII and Special CBM Characters

| Action | Key Sequence |
+--------+--------------+
| Function Key Code Symbols | F1-F8 (machine depending) |
| SHIFT-ed Symbols | `shift`+`A-Z`, `0-9`, `(Symbolic Keys)` |
| C= Symbols | `shift`+`alt`+`A-Z`, `(Symbolic Keys)` |
| C= Colors | `shift`+`alt`+`0-9` |
| CTRL Symbols | `control`+`alt`+`A-Z`, `(Symbolic Keys)` |
| CTRL Colors | `control`+`alt`+`0-9` |
| Arrow Symbols | `control`+`alt`+`Up/Down/Left/RightArrow` |
