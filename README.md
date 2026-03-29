# VidMetrics3 Next

Next.js port of the VidMetrics3 Figma Make export.

## Run

```bash
npm install
npm run dev
```

## Environment

Create a `.env.local` file with:

```dotenv
YOUTUBE_API_KEY=your_youtube_data_api_key
OPENAI_API_KEY=your_openai_api_key
```

`YOUTUBE_API_KEY` powers live channel and video analytics.

`OPENAI_API_KEY` is optional and powers:

- AI strategy summary
- AI compare insight between channels
- AI video-level recommendations in the drawer

## Build

```bash
npm run build
```

# vidmetrics
