#!/bin/bash
DB_URL="postgresql://neondb_owner:npg_ZqrA6EdN2Ifa@ep-little-recipe-aqefz2sd-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
CLERK_KEY="sk_test_6fF4rsXveJMKXzvkqPyFJ5A7jDa3JJp75S0UR9u0xI"

# Start API server in background
cd ~/Downloads/prop-export/artifacts/api-server
npm run build
DATABASE_URL="$DB_URL" PORT=3001 CLERK_SECRET_KEY="$CLERK_KEY" node --enable-source-maps ./dist/index.mjs &

# Start frontend
cd ~/Downloads/prop-export/artifacts/prop-unified
npm run dev
