const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// GET endpoint to fetch playlists
app.get('/api/playlists', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// PUT endpoint to update playlist like status
app.put('/api/playlists/:playlistID/like', async (req, res) => {
    try {
        const { playlistID } = req.params;
        const { liked, likeCount } = req.body;

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Find and update the playlist
        const playlist = jsonData.playlists.find(p => p.playlistID === playlistID);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Update the playlist
        playlist.liked = liked;
        playlist.likeCount = likeCount;

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlist });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
