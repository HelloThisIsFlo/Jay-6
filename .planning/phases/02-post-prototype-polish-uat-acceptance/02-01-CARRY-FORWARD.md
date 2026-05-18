# Phase 2 Carry-Forward Acknowledgement

**Phase:** 02-post-prototype-polish-uat-acceptance
**Plan:** 02-01
**Recorded:** 2026-05-18

> Five Phase 2 REQs shipped before GSD bootstrap (see commits `b73dc98` + `d5b8fb2`). This file records the **acceptance bar** for each so REQUIREMENTS.md coverage is complete without re-implementing already-shipped behaviour. Hands-on re-verification is folded into the Phase 2 UAT walkthrough per **D-15** (CONTEXT.md).

## REQ-clock-receive

TickSource at 24 PPQ. Top-bar Input port + Int/Ext toggle. Ext disables BPM input and slaves engines to incoming OP-1 tempo; switch back to Int re-enables BPM.

- **Acceptance check:** Open the app in Chrome, select a MIDI input port in the TopBar Input dropdown, flip Clock to Ext, press play on the external clock source — BPM field disables and rhythm engines slave to incoming clock.

## REQ-deploy-cloudflare-dev

`just serve` runs Vite + Cloudflare tunnel → `https://jay-6.kempenich.dev`. Use case: OP-1 plugged into the same Mac as the browser (Web MIDI requires same-machine locality, DEC-web-midi-locality).

- **Acceptance check:** Run `just serve`; tunnel URL `https://jay-6.kempenich.dev` returns 200 and the app loads.

## REQ-deploy-k8s-always-on

Container deployed to home K8s cluster (`Dockerfile` nginx:alpine + `k8s.yaml` + GHCR Action + `./deploy.sh`), exposed at `https://jay-6.kempenich.ai` via cluster-wide Cloudflare Tunnel. Browseable from anywhere but can't drive the OP-1 (Web MIDI cannot be proxied — DEC-web-midi-locality).

- **Acceptance check:** `curl -sSI https://jay-6.kempenich.ai` returns `HTTP/2 200` (the K8s always-on deploy).
- **Live check result (recorded by Task 2):** _filled in after Task 2 runs the curl._

## REQ-lan-exposure

`just dev-lan` exposes Vite on `0.0.0.0` so other devices on the same LAN can reach the app. MIDI is denied over plain `http://` (expected per Web MIDI secure-context rule) — the LAN exposure exists for visual testing, not MIDI testing.

- **Acceptance check:** `just dev-lan` exists in justfile and binds Vite to `0.0.0.0` so an iPad on the same LAN can reach the app (MIDI denied over plain http — expected per Web MIDI secure-context rule).

## REQ-ipad-web-midi-browser

Jay-6 works on iPad via Yonemoto's "Web MIDI Browser" app — the only iOS browser with a Web MIDI implementation. Loads `https://jay-6.kempenich.dev`, OP-1 appears in Output dropdown, pads play.

- **Acceptance check:** On iPad inside Yonemoto's Web MIDI Browser app, navigate to `https://jay-6.kempenich.dev`, MIDI permission prompt appears, OP-1 appears in Output dropdown, chord pads play.

---

## Note

These requirements shipped before GSD bootstrap (see commits `b73dc98` + `d5b8fb2`). This file records the acceptance bar without re-implementing — **D-15** places hands-on re-verification inside the Phase 2 UAT walkthrough (verify-phase).
