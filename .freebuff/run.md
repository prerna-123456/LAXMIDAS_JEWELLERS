# Run doc — LAXMIDAS_JEWELLERS (Vite + Express full-stack)

## Reproduce artifacts (fresh checkout)

1. Install dependencies with the project's package manager:
   ```
   pnpm install
   ```
2. Signature-showcase videos: the Featured Collection section plays 7 local videos at
   `public/videos/signature-1.mp4` … `signature-7.mp4` (portrait ~9:16, muted, looping).
   They were copied from the user's WhatsApp downloads; if missing, copy any 7 mp4s into
   `public/videos/` with those names.
3. No `.env` files are needed.

## Run the dev server

```
pnpm dev
```

- Client and API share **port 8080** (configured in `vite.config.ts`, host `::`).
- Check the URL answers before handing off: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/`
- If 8080 is taken by another process, pass an alternate port: `pnpm dev -- --port 8081`.

## Detached start (Freebuff preview, Windows)

```
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

stdout and stderr must go to different files. Confirm with `Get-Process -Id <pid>`.
