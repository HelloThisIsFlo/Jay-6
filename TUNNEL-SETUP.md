# Cloudflare Tunnel Setup

The app is exposed via the existing cluster Cloudflare Tunnel at `https://jay-6.kempenich.ai`.

## Current Route Configuration

- **Tunnel**: the cluster-wide tunnel (also serves `sketchpad.kempenich.ai`, `gprmax.kempenich.ai`)
- **Location**: [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) > **Networks** > **Tunnels** > tunnel > **Public Hostname**
- **Subdomain**: `jay-6`
- **Domain**: `kempenich.ai`
- **Path**: _(empty)_
- **Service Type**: HTTP
- **URL**: `jay-6.jay-6.svc.cluster.local:80`

## Local-only alternative

`just serve` still runs the Vite dev server + a Cloudflare tunnel to
`https://jay-6.kempenich.dev` from this Mac. Use that when the OP-1 is plugged into
the same machine as the browser (Web MIDI can't be proxied across the cluster).

## Cleanup

1. Remove the `jay-6.kempenich.ai` entry from the tunnel's Public Hostname tab
2. Run `./cleanup.sh` to delete the K8s namespace
