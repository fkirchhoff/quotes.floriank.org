```mermaid
erDiagram
    AUTHOR one -- one or more QUOTE : has
    QUOTE one -- zero or one SOURCE : from
    AUTHOR one -- zero or more SOURCE : has
    QUOTE one -- one or more CATEGORY : "relates to"
```
