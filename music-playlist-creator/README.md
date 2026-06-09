# Music Playlist Explorer

A music playlist application with persistent like functionality.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open the app:**
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Features

- Browse all playlists or view a random featured playlist
- Click on any playlist card to see song details
- Like/unlike playlists - likes are saved to `data/data.json`
- Like counts update in real-time and persist across page refreshes

## How It Works

- **Backend**: Node.js/Express server (`server.js`) serves the static files and provides API endpoints
- **Data Persistence**: Likes are saved to `data/data.json` via the backend API
- **Frontend**: Vanilla JavaScript fetches data from the API and updates the UI

## API Endpoints

- `GET /api/playlists` - Fetch all playlists
- `PUT /api/playlists/:playlistID/like` - Update like status for a playlist
  - Body: `{ "liked": boolean, "likeCount": number }`
