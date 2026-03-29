# VidMetrics

VidMetrics is a Next.js YouTube analytics dashboard built for a simple user journey:

1. Paste a YouTube channel handle or URL.
2. Open the analysis dashboard.
3. Review channel performance, video performance, and AI insights.
4. Optionally compare that channel with your own.
5. Use Diff View in the video table to spot gaps quickly.

The app is designed to feel product-like, not developer-only. A first-time user should be able to go from landing page to channel insights in a few seconds.

## What the app does

VidMetrics helps you analyze a YouTube channel using live YouTube data.

It shows:

- channel-level performance snapshot
- KPI cards for views, duration, velocity, and subscribers
- AI strategy summary
- performance trends chart
- recent or all videos table
- deep-dive drawer for each video
- optional channel-vs-channel comparison
- optional video table Diff View when a comparison channel is loaded

## User Journey

### 1. Start on the landing page

The home page gives the user one clear action: enter a YouTube channel.

Supported input examples:

- `@mkbhd`
- `https://youtube.com/@mkbhd`
- `https://youtube.com/channel/UC...`
- `https://youtube.com/c/custom-name`

If the input is invalid, the user is sent back with a clear inline validation state instead of a broken dashboard.

### 2. Open the analysis dashboard

After submitting a valid handle or URL, the app opens:

```text
/analyze?channel=<channel>
```

The dashboard then loads live analytics for that channel.

### 3. Review the main dashboard sections

The analysis page is organized into four sections:

- `Overview`: channel identity, snapshot cards, positioning, and top-level metrics
- `Strategy`: AI-generated strategic summary and next actions
- `Trends`: performance chart for the currently filtered video set
- `Videos`: detailed video table with metrics and deep-dive drawer

### 4. Filter the current analysis

Users can change:

- time range: `This Month`, `Last 7 Days`, `All Videos`
- sorting: `Recently Uploaded`, `Most Viewed`

These controls affect both the visible video list and any compare-based diffing.

### 5. Compare with another channel

From the dashboard, the user can click `Add Your Channel` and load another channel for comparison.

Once loaded, the app shows:

- comparison KPI cards
- AI compare insight
- a second channel baseline for the videos section

The compare search is local to the page, so canceling or refreshing does not leave the app stuck in compare mode.

### 6. Use Diff View in the table

When a compare channel is available, the Videos section exposes a `Diff View` toggle.

This mode shows:

- ranked videos side by side
- views delta
- engagement delta
- velocity delta

It is useful for quickly seeing where the primary channel is ahead or behind the comparison channel.

## AI features

When `OPENAI_API_KEY` is present, the app adds:

- AI strategy summary for the analyzed channel
- AI compare insight across two channels
- AI video-level insight inside the video drawer

If the OpenAI key is missing, the app still works. It falls back to deterministic analytics and heuristic summaries.

## Local setup

### Requirements

- Node.js 20+
- npm
- YouTube Data API key

### Install

```bash
npm install
```

### Environment variables

Create `.env.local` in the project root:

```dotenv
YOUTUBE_API_KEY=your_youtube_data_api_key
OPENAI_API_KEY=your_openai_api_key
```

Environment variables:

- `YOUTUBE_API_KEY`: required for live channel and video analytics
- `OPENAI_API_KEY`: optional, enables AI summaries and recommendations

### Run the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build for production

```bash
npm run build
npm run start
```

## Deploy

### Recommended: Vercel

This app is a standard Next.js App Router project with server API routes, so Vercel is the simplest deployment target.

Steps:

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add environment variables in Project Settings -> Environment Variables.
4. Deploy.

Environment variables to add in Vercel:

- `YOUTUBE_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)

If `YOUTUBE_API_KEY` is missing, the app falls back to mock analytics data.

If `OPENAI_API_KEY` is missing, the app still works and falls back to heuristic AI summaries.

### Netlify

Netlify can host this app too, but Vercel is usually easier for Next.js server routes and App Router behavior.

If you use Netlify, store the same environment variables in Site configuration -> Environment variables.

## Main flows to test

If you want to quickly verify the app manually, use this order:

1. Open the landing page.
2. Submit a valid channel handle such as `@mkbhd`.
3. Confirm the dashboard loads Overview, Strategy, Trends, and Videos.
4. Change the time range and sorting.
5. Open a video drawer from the table.
6. Add a compare channel.
7. Open `Diff View` in the table.
8. Try an invalid input and confirm the user gets a clear validation experience.

## Project structure

Important paths:

- `src/app/page.tsx`: landing page and channel input flow
- `src/app/analyze/page.tsx`: dashboard page state and data loading
- `src/app/api/analyze/route.ts`: channel analysis API
- `src/app/api/compare-insights/route.ts`: AI compare insight API
- `src/app/components/`: dashboard UI components
- `src/lib/metrics.ts`: deterministic metrics and CSV export
- `src/lib/youtube.ts`: YouTube input parsing and validation
- `src/lib/ai.ts`: AI summary and compare logic

## Notes

- The landing page is responsive and the dashboard now includes mobile-safe layouts, but the compare diff table still uses horizontal scrolling on smaller screens.
- YouTube analytics remain the source of truth; AI enriches interpretation, not the raw metrics.
- The frontend owns time-range filtering, so the API returns the broader video set and the dashboard filters it locally.
