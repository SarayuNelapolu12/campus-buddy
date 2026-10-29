# Publish Campus Buddy on Render

The production Node server serves the React app and `/api` from the same public URL.
MongoDB Atlas and Cloudinary continue to store database records and uploaded photos.

1. Put the contents of `campus-buddy` in a GitHub repository. Keep `.gitignore`;
   never upload `.env`, `node_modules`, or `dist`.
2. In Render, create a **Blueprint**, select that repository, and use `render.yaml`.
   If the repository contains the outer `Fsd project` folder instead, set the Blueprint
   path to `campus-buddy/render.yaml` and the web service root directory to `campus-buddy`.
3. Enter the MongoDB URI, admin email, and three Cloudinary values from `server/.env`
   in Render's secret environment fields. The Blueprint generates a new JWT secret.
4. In MongoDB Atlas Network Access, allow the Render service's outbound IP ranges
   shown in the Render dashboard. Your laptop's IP entry alone will not allow Render.
5. Deploy. Render runs `npm run build` and `npm start` from `campus-buddy`.
6. Open the assigned HTTPS URL. Test registration, login, listing creation, image upload,
   and refreshing `/register` directly. `/api/health` should return `status: ok`.

Do not set `VITE_API_URL` on Render for this single-service setup; production uses `/api`.
Your local `client/.env` continues to use `http://localhost:5000/api`.
`CLIENT_URL` can be set to the final public origin if you later use a separate frontend.

Free hosting can sleep when idle and may have usage limits. Review the selected plan
in Render before deployment. Once deployed, visitors use the HTTPS URL and your laptop
does not need to stay on.
