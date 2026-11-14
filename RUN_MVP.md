# Run FireLens

Current redesigned entrypoint: `release/FireLens_Butte_Offline.html`. Static hosting folder: `release/site/`. Development: run `npm ci` then `npm run dev` inside `frontend/`. Rebuild and test using the root README instructions. Python science processing and the React frontend remain separate.

Exact replay writes to a new folder: `python process_butte_county.py --out results_exact_replay_NEW`. Never run an original-data replay over results/. Existing exact replay evidence already matches the supplied county rows; downloading detection archives again is unnecessary.
