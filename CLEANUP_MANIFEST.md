# Repository cleanup inventory and manifest

Original tracked tree archived outside the public repository in workspace audit/final-release/baseline-repository.zip; per-file baseline and removed bytes retained alongside it. Git history is preserved.

| Removed public path | Reason | Original SHA-256 |
|---|---|---|
| CODEX_FIRST_MESSAGE_FIRELENS.txt | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 27082347a1fc3a011125138dcc587becac41464d1ccd94361cc61602e7844b36 |
| FIRELENS_CODEX_AUDIT_HANDOFF.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | dd22a68c486c20312bba19458957b32190d6266b309d54a4e4f6344ae6a85f0f |
| OPEN_THIS_FIRST.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 38cb37d7ce83a4d9d2033ae49b0baafd702497ddc90af866701913f7ff53487f |
| QA_CHECKLIST.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 4bfba047a0ac99159d73b0dbfb0b1564568ec0d7fe576e9a8d96e4843a66e33c |
| README_START_HERE.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 4a0a35ee6c40ca772bdbd28bbb51331eff8337c61c1da3cd6bd9548642d1d3c6 |
| RUN_MVP.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | a1a28c1e78fb644991ff8996ef1cf7d500030f00fb8ff675fbf19fe0e933e92b |
| frontend/pnpm-lock.yaml | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 323c373e7b126a5e72dda94dca6eaf26dc501e2d47ec3c144c66733ed71b9599 |
| frontend/PROTOTYPE.md | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | bb8c43898e3cb930b18775f93bc0280dec3471be058268c4d87ce33f8df394e5 |
| frontend/.mise.toml | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 6d2834ef5f78a7dc4c384570a62b895137fdf63df171d237f0747932bd001435 |
| release/FireLens_Butte_Source_2026-11-14.zip | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 7bb354fee84daacf127730f9f31ced40af6cc02207e57848b9f3de817da88a4e |
| release/FireLens_Butte_Static_Site.zip | Superseded handoff/prototype, unused alternate tool configuration/lockfile, or stale package rebuilt after cleanup | 7cc189838829c8e5e22039e6075f1918af7f28ec595c48e5d20c8cda512afc20 |

Retained web/ and pipeline/build_offline.py: harmonize.py still generates web/data; removing this would break the documented legacy reproduction. Retained charts, results_exact_replay, original archives, processing scripts, scientific evidence and release browser evidence. Retained frontend/AGENTS.md as useful developer guidance. npm ci uses package-lock.json; pnpm workflow is absent. Removed files were checked against production pipeline/test references before removal; obsolete documentation links are superseded by README. No history rewrite. Old commits still contain historical scaffolding.
