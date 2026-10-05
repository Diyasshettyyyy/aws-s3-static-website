# EventHub

A responsive event discovery frontend built with Vite. It includes event search and categories, saved events, a newsletter form, and event organizer sections.

## Run locally

```sh
npm ci
npm run dev
```

## Build for Amazon S3

```sh
npm ci
npm run build
```

Upload the contents of `dist/` to the root of an S3 bucket configured for static website hosting. Set `index.html` as the index document. The site uses remote Unsplash images and Google Fonts.

The event list and signup form are demo interactions; connect a backend before using them for real bookings or email subscriptions.
