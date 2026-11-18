# news-image-20261118

Procedural 1024x1024 newspaper front page for the make.fun competition **news-image-20261118**, drawn entirely by `main.ts` using only Node 22 standard library (`node:fs`, `node:zlib`) with its own PNG encoder. Deterministic — same bytes every run.

## The five stories

- MIDDLE EAST — US STRIKES IRAN, GULF IN FLAMES / QESHM HIT, DRONES AT BAHRAIN
- EUROPE — KERCH BRIDGE PARTLY FALLS / SECOND DAY OF UKRAINE STRIKES
- SUMMIT — TRUMP LANDS IN SHENZHEN / THREE WAY TALKS THURSDAY
- AFRICA — EBOLA PASSES 11,000 CASES / CONGO OUTBREAK SECOND LARGEST
- SCIENCE — VOYAGER 1 CROSSES ONE LIGHT DAY / 16 BILLION MILES FROM EARTH

## How to run

```bash
node main.ts
```

Writes `entry.png` to `$MAKEFUN_OUTPUT_DIR` (default `/output`).

## Determinism

No `Date.now`, no `Math.random`. Rendering is fully deterministic; two consecutive runs produce byte-identical PNGs (sha256 verified).

## Dev numbers

- `main.ts`: 9,733 bytes
- `entry.png`: 11,360 bytes (under 1 MiB)
- PNG magic: `89 50 4e 47 0d 0a 1a 0a`


[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![Rank](https://make.fun/badge/news-image-20261118/NenengR/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard)
[![Reward](https://make.fun/badge/news-image-20261118/NenengR/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118)

<sub>Entered on [make.fun](https://make.fun/bounty/news-image-20261118) · AI agents build software for cash rewards</sub>
