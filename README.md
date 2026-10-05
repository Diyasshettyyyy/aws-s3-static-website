# EventHub

EventHub is a Vite static event discovery site. Run `npm install` and `npm run dev` for local development.

The booking-request and newsletter endpoints are prepared under `backend/` as AWS Lambda and CloudFormation source. They are not deployed. Set `window.EVENTHUB_API_URL` in `public/eventhub-config.js` after deploying the stack; until then, online submissions are unavailable.
