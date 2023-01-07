```mermaid
erDiagram
    AUTHOR ||--|{ QUOTE : has
    QUOTE ||--o| SOURCE : from
    AUTHOR ||--o{ SOURCE : has
    QUOTE ||--|{ CATEGORY : "relates to"
```
