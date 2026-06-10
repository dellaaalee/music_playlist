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

// Disable caching for development
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

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

// POST endpoint to create a new playlist
app.post('/api/playlists', async (req, res) => {
    try {
        const { name, author, songs } = req.body;

        // Validate required fields: name, author, and at least one song
        if (!name || !name.trim() || !author || !author.trim()) {
            return res.status(400).json({ error: 'Playlist name and author are required' });
        }
        if (!Array.isArray(songs) || songs.length === 0) {
            return res.status(400).json({ error: 'A playlist must have at least one song' });
        }

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Keep only valid song IDs that exist in the song library
        const validSongs = songs.filter(songID => jsonData.songs[songID]);
        if (validSongs.length === 0) {
            return res.status(400).json({ error: 'A playlist must have at least one valid song' });
        }

        // Generate a new unique playlist ID (pNNN, incrementing the highest existing number)
        const existingNumbers = jsonData.playlists
            .map(p => parseInt(String(p.playlistID).replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));
        const nextNumber = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
        const playlistID = 'p' + String(nextNumber).padStart(3, '0');

        // Generate a cover URL from the playlist name (matches the picsum seed pattern in data)
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'playlist';

        const newPlaylist = {
            playlistID,
            name: name.trim(),
            cover: `https://picsum.photos/seed/${slug}/420/240`,
            author: author.trim(),
            likeCount: 0,
            liked: false,
            songs: validSongs
        };

        jsonData.playlists.push(newPlaylist);

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.status(201).json({ success: true, playlist: newPlaylist });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
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

        // Validate and update the playlist
        // Ensure like count never goes negative
        let validatedLikeCount = Math.max(0, likeCount);

        // If like count is 0, liked must be false
        let validatedLiked = validatedLikeCount === 0 ? false : liked;

        playlist.liked = validatedLiked;
        playlist.likeCount = validatedLikeCount;

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlist });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

// PUT endpoint to update playlist details (name and author)
app.put('/api/playlists/:playlistID/details', async (req, res) => {
    try {
        const { playlistID } = req.params;
        const { name, author } = req.body;

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Find and update the playlist
        const playlist = jsonData.playlists.find(p => p.playlistID === playlistID);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Update playlist details
        if (name !== undefined && name.trim() !== '') {
            playlist.name = name.trim();
        }
        if (author !== undefined && author.trim() !== '') {
            playlist.author = author.trim();
        }

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlist });
    } catch (error) {
        console.error('Error updating playlist details:', error);
        res.status(500).json({ error: 'Failed to update playlist details' });
    }
});

// POST endpoint to add a song to a playlist
app.post('/api/playlists/:playlistID/songs', async (req, res) => {
    try {
        const { playlistID } = req.params;
        const { songID } = req.body;

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Find the playlist
        const playlist = jsonData.playlists.find(p => p.playlistID === playlistID);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check if song exists in the songs library
        if (!jsonData.songs[songID]) {
            return res.status(404).json({ error: 'Song not found in library' });
        }

        // Check if song is already in the playlist
        if (playlist.songs.includes(songID)) {
            return res.status(400).json({ error: 'Song already in playlist' });
        }

        // Add the song to the playlist
        playlist.songs.push(songID);

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlistID, songID, allSongs: playlist.songs });
    } catch (error) {
        console.error('Error adding song:', error);
        res.status(500).json({ error: 'Failed to add song' });
    }
});

// DELETE endpoint to remove a song from a playlist
app.delete('/api/playlists/:playlistID/songs/:songID', async (req, res) => {
    try {
        const { playlistID, songID } = req.params;

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Find the playlist
        const playlist = jsonData.playlists.find(p => p.playlistID === playlistID);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Find and remove the song
        const songIndex = playlist.songs.indexOf(songID);

        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not found in playlist' });
        }

        playlist.songs.splice(songIndex, 1);

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlistID, songID, remainingSongs: playlist.songs });
    } catch (error) {
        console.error('Error removing song:', error);
        res.status(500).json({ error: 'Failed to remove song' });
    }
});

// DELETE endpoint to delete a playlist
app.delete('/api/playlists/:playlistID', async (req, res) => {
    try {
        const { playlistID } = req.params;

        // Read current data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);

        // Find the playlist index
        const playlistIndex = jsonData.playlists.findIndex(p => p.playlistID === playlistID);

        if (playlistIndex === -1) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Remove the playlist
        jsonData.playlists.splice(playlistIndex, 1);

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, playlistID });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
