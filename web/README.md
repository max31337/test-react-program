# IP Geo Web

React + Vite + Tailwind UI for logging in and viewing IP geolocation.

## Features
- Auth (login) hitting local API `/api/login`
- Displays current user IP geolocation
- Search other IPs with validation
- History list with re-load, multi-select delete
- Map (Leaflet) showing location

## Setup
1. Copy `.env.example` to `.env` and the contents for both api and web folder
2. Install deps: `npm install`
3. Run dev: `npm run dev`

## Build
`npm run build`

Deploy to Vercel (root should be `web` folder, build command `npm run build`, output `dist`).
