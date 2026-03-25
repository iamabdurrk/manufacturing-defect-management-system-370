# Manufacturing Defect Management System (Web Frontend)

## Run
```bash
npm install
npm run dev
```

## Environment variables
Set one of these (see `.env.example` in this container):

- `REACT_APP_API_BASE` (preferred)
- `REACT_APP_BACKEND_URL` (alias)

Example:
```
REACT_APP_API_BASE=http://localhost:3001
```

## Notes
- All API calls are aligned to `tmp_backend_openapi.json` snapshot at repo root.
- RCA is treated as a workflow gate; UI surfaces “RCA required” before users hit backend rejections.
"
