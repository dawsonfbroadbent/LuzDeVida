# API & Coding Standards

## Response Envelope
All API responses must use this JSON structure.

### Success (200/201)
```json
{
  "success": true,
  "data": { "key": "value" },
  "error": null,
  "meta": { "timestamp": "2026-04-06T17:08:35Z" }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_SPECIFIC_CODE",
    "message": "Human-readable explanation.",
    "details": []
  }
}
```

## HTTP Status Codes
| Code | Use |
|------|-----|
| 400 | Validation or business logic errors |
| 401 | Missing or expired auth token |
| 403 | Valid auth, insufficient permissions |
| 404 | Resource not found |
| 500 | Unhandled server-side error |

## Error Handling
- No silent fails — every `try-catch` must recover, log with context, or rethrow
- Validate inputs at the edge (DTOs / Zod schemas) before reaching service logic
- Default to maximally restrictive access; loosen only where functionality requires it

## Coding Standards
- **Type safety**: No `any` in TypeScript, no `dynamic` in C# — use strict types and DTOs throughout
- **Separation of concerns**: Business logic belongs in Services/Domain layers, not Controllers/Routes
- **Explicit returns**: Every function must declare a return type
- **Input sanitization**: Sanitize all inputs; never trust client-side data for sensitive operations
- **No hallucinated dependencies**: Do not use libraries, endpoints, or fields not defined in project context
- **DRY**: Keep logic decoupled; avoid duplication across layers
