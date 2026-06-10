const playlistModal = document.getElementById("playlistModal");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");
const shuffleButton = document.getElementById("shuffleButton");
const aiSummaryButton = document.getElementById("aiSummaryButton");
const aiSummaryText = document.getElementById("aiSummaryText");
const tabButtons = document.querySelectorAll(".tab-button");
const appContent = document.querySelector(".app-content");

// Add song modal elements
const addSongModal = document.getElementById("addSongModal");
const addSongList = document.getElementById("addSongList");
const closeAddSongModal = document.getElementById("closeAddSongModal");

// Search bar elements
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");

// Sort elements
const sortSelect = document.getElementById("sortSelect");
const sortBar = document.querySelector(".sort-bar");

// Menu dropdown elements
const menuButton = document.getElementById("menuButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const editPlaylistButton = document.getElementById("editPlaylistButton");
const deletePlaylistButton = document.getElementById("deletePlaylistButton");

// Debug: Check if elements exist
console.log('Menu elements loaded:', {
    menuButton: !!menuButton,
    dropdownMenu: !!dropdownMenu,
    editPlaylistButton: !!editPlaylistButton,
    deletePlaylistButton: !!deletePlaylistButton
});

// OpenRouter AI summary configuration
// OPENROUTER_API_KEY is provided by secrets.js (gitignored), loaded before this script in index.html
const AI_MODEL = "openrouter/free"; // ":free" pins a free OpenRouter model variant
const FALLBACK_MESSAGE = "description unavailable - try again in a moment";

// Store fetched data globally
let playlistsData = [];
let songsData = {};
let currentPlaylistID = null; // Track the currently open playlist in modal
let isEditMode = false; // Track if we're in edit mode

/**
 * Fetches playlist data from backend API
 *
 * Takes in: Nothing (fetches from backend API)
 * Returns: Promise<Array> - array of playlist objects
 * DOM element it appends to: .playlist-grid (via renderAllView)
 * Fields used: playlistID, name, cover, author, likeCount, liked, songs (array of song IDs)
 */
async function loadPlaylistData() {
    try {
        // Fetch data from backend API
        const response = await fetch('http://localhost:8080/api/playlists');
        const data = await response.json();
        playlistsData = data.playlists;
        songsData = data.songs;

        return playlistsData;
    } catch (error) {
        console.error('Error loading playlist data:', error);
        return [];
    }
}

/**
 * Save playlist like state to backend
 */
async function savePlaylistLike(playlistID, liked, likeCount) {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/${playlistID}/like`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ liked, likeCount })
        });

        if (!response.ok) {
            throw new Error('Failed to update playlist');
        }

        const result = await response.json();
        console.log('Successfully updated playlist:', result);
        return result;
    } catch (error) {
        console.error('Error saving playlist like:', error);
        throw error;
    }
}

/**
 * Delete playlist from backend
 */
async function deletePlaylist(playlistID) {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/${playlistID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete playlist');
        }

        const result = await response.json();
        console.log('Successfully deleted playlist:', result);
        return result;
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
}

/**
 * Remove song from playlist via backend
 */
async function removeSongFromPlaylist(playlistID, songID) {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/${playlistID}/songs/${songID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove song');
        }

        const result = await response.json();
        console.log('Successfully removed song:', result);
        return result;
    } catch (error) {
        console.error('Error removing song:', error);
        throw error;
    }
}

/**
 * Update playlist details (name and author) via backend
 */
async function updatePlaylistDetails(playlistID, name, author) {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/${playlistID}/details`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, author })
        });

        if (!response.ok) {
            throw new Error('Failed to update playlist details');
        }

        const result = await response.json();
        console.log('Successfully updated playlist details:', result);
        return result;
    } catch (error) {
        console.error('Error updating playlist details:', error);
        throw error;
    }
}

/**
 * Add song to playlist via backend
 */
async function addSongToPlaylist(playlistID, songID) {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/${playlistID}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ songID })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add song');
        }

        const result = await response.json();
        console.log('Successfully added song:', result);
        return result;
    } catch (error) {
        console.error('Error adding song:', error);
        throw error;
    }
}

/**
 * Resolves song IDs to full song objects
 *
 * Takes in: songIDs (array) - array of song IDs
 * Returns: array of song objects
 */
function resolveSongs(songIDs) {
    if (!songIDs || songIDs.length === 0) {
        return [];
    }

    return songIDs.map(songID => songsData[songID]).filter(song => song !== undefined);
}

/**
 * Builds song rows HTML from playlist songs array in data.json
 *
 * Takes in: songs (array) - array of song objects
 * Returns: string - HTML string of song rows
 * DOM element it appends to: returned HTML is inserted into #songList by openModal()
 * Fields used from each song: title, artist, album, duration, cover
 */
function buildSongRows(songs) {
    // Add "Add Music" row if in edit mode
    let html = '';
    if (isEditMode) {
        html = `
            <div class="song-row add-music-row">
                <div class="song-meta">
                    <div class="add-music-icon">+</div>
                    <div class="song-text">
                        <p class="song-title">Add Music</p>
                    </div>
                </div>
            </div>
        `;
    }

    // If no songs, show appropriate message
    if (!songs || songs.length === 0) {
        if (isEditMode) {
            // In edit mode, just show the Add Music button (already added above)
            return html;
        } else {
            // In view mode, show "no songs" message
            return '<p>No songs available</p>';
        }
    }

    html += songs.map((song) => `
        <div class="song-row" data-song-id="${song.songID}">
            <div class="song-meta">
                <img class="song-thumb" src="${song.cover}" alt="Cover art for ${song.title}">
                <div class="song-text">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-album">${song.album}</p>
                </div>
            </div>
            <div class="song-actions">
                ${isEditMode ? `
                    <button class="remove-song-button" data-song-id="${song.songID}" aria-label="Remove song">
                        <svg class="minus-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                ` : ''}
                <p class="song-duration">${song.duration}</p>
            </div>
        </div>
    `).join("");

    return html;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 *
 * Takes in: array - array to shuffle
 * Returns: new shuffled array (does not modify original)
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Opens the modal with playlist details from data.json
 *
 * Takes in: playlistID (string) - unique identifier for the playlist
 * Returns: nothing
 * DOM element it appends to: Updates #playlistName, #playlistImage, #playlistCreator, #songList
 * Fields used: name, cover, author, songs (array with title, artist, album, duration, cover)
 */
function openModal(playlistID) {
    // Find the playlist in the loaded data
    const playlist = playlistsData.find(p => p.playlistID === playlistID);

    if (!playlist) {
        console.error('Playlist not found:', playlistID);
        return;
    }

    // Track the current playlist ID
    currentPlaylistID = playlistID;

    // Resolve song IDs to full song objects
    const songs = resolveSongs(playlist.songs);

    // Update modal with playlist data from data.json
    playlistName.textContent = playlist.name;
    playlistImage.src = playlist.cover;
    playlistImage.alt = `Cover art for ${playlist.name}`;
    playlistCreator.textContent = playlist.author;

    // Build and insert song rows using resolved songs
    songList.innerHTML = buildSongRows(songs);

    // Set up shuffle button for this playlist
    setupShuffleButton(songs);

    // Reset and set up the AI summary for this playlist
    aiSummaryText.textContent = "";
    aiSummaryText.classList.remove("loading");
    aiSummaryText.classList.add("hidden");
    setupAiSummaryButton(playlist, songs);

    playlistModal.style.display = "flex";
    playlistModal.setAttribute("aria-hidden", "false");
}

/**
 * Sets up the shuffle button for the current playlist
 *
 * Takes in: songs (array) - resolved song objects
 * Returns: nothing
 * DOM element it updates: #songList (re-renders with shuffled songs)
 */
function setupShuffleButton(songs) {
    // Get fresh reference to the shuffle button
    const currentShuffleButton = document.getElementById("shuffleButton");

    // Remove any existing listeners by cloning the button
    const newShuffleButton = currentShuffleButton.cloneNode(true);
    currentShuffleButton.parentNode.replaceChild(newShuffleButton, currentShuffleButton);

    // Add click listener to the new button
    newShuffleButton.addEventListener("click", (event) => {
        event.preventDefault();

        // Shuffle the songs
        const shuffledSongs = shuffleArray(songs);

        // Re-render the song list with shuffled order
        songList.innerHTML = buildSongRows(shuffledSongs);
    });
}

/**
 * Builds the user prompt sent to the AI model
 *
 * Takes in: playlist (object) - the playlist being summarized
 *           songs (array) - resolved song objects (used only to convey vibe)
 * Returns: string - the prompt describing the role, task, inputs, and constraints
 * Constraint: instructs the model to avoid naming any specific songs
 */
function buildSummaryPrompt(playlist, songs) {
    // Provide artist/album context only, so the model can infer the vibe
    // without us asking it to reference individual tracks.
    const songContext = songs
        .map((song) => `${song.artist} (${song.album})`)
        .join(", ");

    return `You are a music curator writing a short blurb for a playlist.

Playlist name: ${playlist.name}
Created by: ${playlist.author}
Artists and albums featured: ${songContext || "various artists"}

Task: Write a 1-2 sentence description that captures the overall vibe, theme, and mood (e.g. melancholic, high energy) of this playlist.

Constraints:
- Keep it under 3 sentences; write it as a single, cohesive piece of prose.
- Do NOT mention or list any specific songs, track titles, the playlist name, author, artists, or albums.
- Avoid generic marketing language (e.g. "the perfect playlist for any occasion").
- Return only the description as plain text. Do not use bullet points, numbered lists, hashtags, or headings.`;
}

/**
 * Calls the OpenRouter chat completions API to generate a playlist description
 *
 * Takes in: playlist (object), songs (array of resolved song objects)
 * Returns: Promise<string> - the generated description, or FALLBACK_MESSAGE on failure
 * API: POST https://openrouter.ai/api/v1/chat/completions (model: google/gemma-3-27b-it:free)
 */
async function getPlaylistSummary(playlist, songs) {
    try {
        // Guard against a missing/unloaded key from secrets.js
        if (typeof OPENROUTER_API_KEY === "undefined" || !OPENROUTER_API_KEY) {
            throw new Error("Missing OpenRouter API key");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    { role: "user", content: buildSummaryPrompt(playlist, songs) }
                ]
            })
        });

        if (!response.ok) {111
            throw new Error(`OpenRouter ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI summary failed:", error);
        return FALLBACK_MESSAGE;
    }
}

/**
 * Sets up the AI Summary button for the current playlist
 *
 * Takes in: playlist (object), songs (array of resolved song objects)
 * Returns: nothing
 * DOM element it updates: #aiSummaryText (shows loading, then the description)
 */
function setupAiSummaryButton(playlist, songs) {
    // Get a fresh reference and clone-replace to clear any stale listeners
    const currentButton = document.getElementById("aiSummaryButton");
    const newButton = currentButton.cloneNode(true);
    currentButton.parentNode.replaceChild(newButton, currentButton);

    newButton.addEventListener("click", async () => {
        // Disable the button and show a loading message while we wait
        newButton.disabled = true;
        aiSummaryText.textContent = "Generating description…";
        aiSummaryText.classList.add("loading");
        aiSummaryText.classList.remove("hidden");

        try {
            const summary = await getPlaylistSummary(playlist, songs);
            aiSummaryText.textContent = summary;
            aiSummaryText.classList.remove("loading");
        } finally {
            // Re-enable on both success and failure
            newButton.disabled = false;
        }
    });
}

/**
 * Enable editing of playlist name and author
 */
function enablePlaylistDetailsEditing() {
    playlistName.setAttribute('contenteditable', 'true');
    playlistCreator.setAttribute('contenteditable', 'true');

    playlistName.classList.add('editable');
    playlistCreator.classList.add('editable');

    // Store original values
    playlistName.dataset.originalValue = playlistName.textContent;
    playlistCreator.dataset.originalValue = playlistCreator.textContent;

    // Add blur event listeners to save changes
    playlistName.addEventListener('blur', savePlaylistDetails);
    playlistCreator.addEventListener('blur', savePlaylistDetails);

    // Add Enter key handler to blur and save
    playlistName.addEventListener('keypress', handleEnterKey);
    playlistCreator.addEventListener('keypress', handleEnterKey);
}

/**
 * Disable editing of playlist name and author
 */
function disablePlaylistDetailsEditing() {
    playlistName.setAttribute('contenteditable', 'false');
    playlistCreator.setAttribute('contenteditable', 'false');

    playlistName.classList.remove('editable');
    playlistCreator.classList.remove('editable');

    // Remove event listeners
    playlistName.removeEventListener('blur', savePlaylistDetails);
    playlistCreator.removeEventListener('blur', savePlaylistDetails);
    playlistName.removeEventListener('keypress', handleEnterKey);
    playlistCreator.removeEventListener('keypress', handleEnterKey);
}

/**
 * Handle Enter key press to blur and save
 */
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
}

/**
 * Save playlist details when user finishes editing
 */
async function savePlaylistDetails() {
    const newName = playlistName.textContent.trim();
    const newAuthor = playlistCreator.textContent.trim();

    const originalName = playlistName.dataset.originalValue;
    const originalAuthor = playlistCreator.dataset.originalValue;

    // Check if anything changed
    if (newName === originalName && newAuthor === originalAuthor) {
        return;
    }

    // Validate inputs
    if (!newName || !newAuthor) {
        alert('Playlist name and author cannot be empty');
        playlistName.textContent = originalName;
        playlistCreator.textContent = originalAuthor;
        return;
    }

    try {
        // Update backend
        await updatePlaylistDetails(currentPlaylistID, newName, newAuthor);

        // Update local data
        const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
        if (playlist) {
            playlist.name = newName;
            playlist.author = newAuthor;
        }

        // Update stored original values
        playlistName.dataset.originalValue = newName;
        playlistCreator.dataset.originalValue = newAuthor;

        // Re-render the view to reflect changes in the grid
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab && activeTab.dataset.view === 'all') {
            renderAllView();
        } else {
            renderFeaturedView();
        }

        console.log('Playlist details updated successfully');
    } catch (error) {
        console.error('Error updating playlist details:', error);
        alert('Failed to update playlist details. Please try again.');
        // Revert to original values
        playlistName.textContent = originalName;
        playlistCreator.textContent = originalAuthor;
    }
}

/**
 * Set up event listeners for edit mode (add music and remove song buttons)
 */
function setupEditModeListeners() {
    // Add music button
    const addMusicRow = document.querySelector('.add-music-row');
    if (addMusicRow) {
        addMusicRow.addEventListener('click', () => {
            console.log('Add music clicked');
            openAddSongModal();
        });
    }

    // Remove song buttons
    const removeButtons = document.querySelectorAll('.remove-song-button');
    removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            const songID = button.dataset.songId;

            if (!confirm('Remove this song from the playlist?')) {
                return;
            }

            try {
                // Remove song from backend (updates data.json)
                await removeSongFromPlaylist(currentPlaylistID, songID);

                // Update local data
                const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
                if (playlist) {
                    const songIndex = playlist.songs.indexOf(songID);
                    if (songIndex > -1) {
                        playlist.songs.splice(songIndex, 1);

                        // Re-render the song list
                        const songs = resolveSongs(playlist.songs);
                        songList.innerHTML = buildSongRows(songs);

                        // Re-setup listeners
                        if (isEditMode) {
                            setupEditModeListeners();
                        }

                        console.log('Song removed from playlist and data.json:', songID);
                    }
                }
            } catch (error) {
                console.error('Error removing song:', error);
                alert('Failed to remove song. Please try again.');
            }
        });
    });
}

function closeModal() {
    playlistModal.style.display = "none";
    playlistModal.setAttribute("aria-hidden", "true");

    // Reset edit mode when closing modal
    if (isEditMode) {
        disablePlaylistDetailsEditing();
        isEditMode = false;
    }
}

/**
 * Open add song modal and populate with all available songs
 */
function openAddSongModal() {
    const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
    if (!playlist) {
        console.error('Playlist not found');
        return;
    }

    // Get all songs from songsData
    const allSongs = Object.values(songsData);

    // Build the song list HTML
    const songItems = allSongs.map(song => {
        const isInPlaylist = playlist.songs.includes(song.songID);
        return `
            <div class="add-song-item ${isInPlaylist ? 'in-playlist' : ''}" data-song-id="${song.songID}">
                <img class="song-thumb" src="${song.cover}" alt="Cover art for ${song.title}">
                <div class="song-info">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                </div>
                <svg class="add-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${isInPlaylist ?
                        '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' :
                        '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                    }
                </svg>
            </div>
        `;
    }).join('');

    addSongList.innerHTML = songItems;

    // Set up click listeners for each song
    setupAddSongListeners();

    // Show the modal
    addSongModal.style.display = "flex";
    addSongModal.setAttribute("aria-hidden", "false");
}

/**
 * Close add song modal
 */
function closeAddSongModalFunc() {
    addSongModal.style.display = "none";
    addSongModal.setAttribute("aria-hidden", "true");
}

/**
 * Set up event listeners for add song items
 */
function setupAddSongListeners() {
    const addSongItems = document.querySelectorAll('.add-song-item:not(.in-playlist)');
    addSongItems.forEach(item => {
        item.addEventListener('click', async () => {
            const songID = item.dataset.songId;

            try {
                // Add song to playlist via backend
                await addSongToPlaylist(currentPlaylistID, songID);

                // Update local data
                const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
                if (playlist) {
                    playlist.songs.push(songID);

                    // Re-render the main song list
                    const songs = resolveSongs(playlist.songs);
                    songList.innerHTML = buildSongRows(songs);

                    // Re-setup edit mode listeners
                    if (isEditMode) {
                        setupEditModeListeners();
                    }

                    // Mark this song as added in the add song modal
                    item.classList.add('in-playlist');
                    const icon = item.querySelector('.add-icon');
                    icon.innerHTML = '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

                    console.log('Song added to playlist:', songID);
                }
            } catch (error) {
                console.error('Error adding song:', error);
                if (error.message.includes('already in playlist')) {
                    alert('This song is already in the playlist.');
                } else {
                    alert('Failed to add song. Please try again.');
                }
            }
        });
    });
}

function closeModal() {
    playlistModal.style.display = "none";
    playlistModal.setAttribute("aria-hidden", "true");

    // Reset edit mode when closing modal
    if (isEditMode) {
        disablePlaylistDetailsEditing();
        isEditMode = false;
    }
}

// Close modal when clicking on the overlay background
if (playlistModal) {
    playlistModal.addEventListener("click", (event) => {
        if (event.target === playlistModal) {
            closeModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        // Close add song modal if open
        if (addSongModal.style.display === "flex") {
            closeAddSongModalFunc();
        } else {
            closeModal();
        }
    }
});

// Close add song modal when clicking X button
if (closeAddSongModal) {
    closeAddSongModal.addEventListener("click", () => {
        closeAddSongModalFunc();
    });
}

// Close add song modal when clicking on overlay
if (addSongModal) {
    addSongModal.addEventListener("click", (event) => {
        if (event.target === addSongModal) {
            closeAddSongModalFunc();
        }
    });
}

// Render Featured view with a random playlist
function renderFeaturedView() {
    // Select a random playlist from the loaded data
    const randomIndex = Math.floor(Math.random() * playlistsData.length);
    const featuredPlaylist = playlistsData[randomIndex];

    if (!featuredPlaylist) {
        appContent.innerHTML = '<p>No playlists available</p>';
        return;
    }

    // Resolve song IDs to full song objects
    const songs = resolveSongs(featuredPlaylist.songs);

    const songRows = songs.map((song) => `
        <div class="featured-song-row">
            <img class="featured-song-thumb" src="${song.cover}" alt="Cover art for ${song.title}">
            <div class="featured-song-text">
                <p class="featured-song-title">${song.title}</p>
                <p class="featured-song-artist">${song.artist}</p>
                <p class="featured-song-album">${song.album}</p>
            </div>
            <p class="featured-song-duration">${song.duration}</p>
        </div>
    `).join("");

    appContent.innerHTML = `
        <div class="featured-container">
            <div class="featured-main">
                <img class="featured-image" src="${featuredPlaylist.cover}" alt="Cover art for ${featuredPlaylist.name}">
                <h2 class="featured-title">${featuredPlaylist.name}</h2>
                <p class="featured-author">by ${featuredPlaylist.author}</p>
            </div>
            <div class="featured-songs">
                ${songRows}
            </div>
        </div>
    `;
}

// Render All playlists view
function renderAllView(filteredPlaylists = null) {
    // Use filtered playlists if provided, otherwise use all playlists
    let playlistsToRender = filteredPlaylists || playlistsData;

    // Apply sorting
    const sortBy = sortSelect ? sortSelect.value : 'default';
    playlistsToRender = sortPlaylists(playlistsToRender, sortBy);

    if (playlistsToRender.length === 0) {
        appContent.innerHTML = `
            <div class="no-results">
                <p>No playlists found matching your search.</p>
            </div>
        `;
        return;
    }

    const playlistCards = playlistsToRender.map(playlist => `
        <article class="playlist-card" data-playlist-id="${playlist.playlistID}">
            <img class="cover-image" src="${playlist.cover}" alt="Cover art for ${playlist.name} playlist">
            <h2 class="playlist-title">${playlist.name}</h2>
            <p class="creator-name">${playlist.author}</p>
            <div class="like-container">
                <button type="button" class="like-button ${playlist.liked ? 'liked' : ''}" data-playlist-id="${playlist.playlistID}" aria-label="Like playlist">
                    ${playlist.liked ? '♥' : '♡'}
                </button>
                <span class="like-count">${playlist.likeCount}</span>
            </div>
        </article>
    `).join('');

    appContent.innerHTML = `
        <section class="playlist-grid" aria-label="Playlist cards">
            ${playlistCards}
        </section>
    `;

    // Event delegation is set up globally, no need to attach listeners here
}

// Toggle like status for a playlist
async function toggleLike(playlistID) {
    console.log('toggleLike called for:', playlistID);

    const playlist = playlistsData.find(p => p.playlistID === playlistID);
    if (!playlist) {
        console.error('Playlist not found:', playlistID);
        return;
    }

    console.log('Before toggle - liked:', playlist.liked, 'likeCount:', playlist.likeCount);

    // Toggle liked state
    playlist.liked = !playlist.liked;

    // Update like count
    if (playlist.liked) {
        playlist.likeCount++;
    } else {
        playlist.likeCount--;
        // Ensure like count never goes negative
        if (playlist.likeCount < 0) {
            playlist.likeCount = 0;
        }
    }

    // Force liked to be false if count is 0
    if (playlist.likeCount === 0) {
        playlist.liked = false;
    }

    console.log('After toggle - liked:', playlist.liked, 'likeCount:', playlist.likeCount);

    // Update the UI immediately for better UX
    const likeButton = document.querySelector(`.like-button[data-playlist-id="${playlistID}"]`);
    const likeCountSpan = likeButton.parentElement.querySelector('.like-count');

    if (playlist.liked) {
        likeButton.classList.add('liked');
        likeButton.textContent = '♥';
    } else {
        likeButton.classList.remove('liked');
        likeButton.textContent = '♡';
    }

    likeCountSpan.textContent = playlist.likeCount;
    console.log('UI updated - likeCount span now shows:', likeCountSpan.textContent);

    // Save to backend (persists to data.json)
    try {
        console.log('Sending update to backend...');
        await savePlaylistLike(playlistID, playlist.liked, playlist.likeCount);
        console.log('Backend update successful');
    } catch (error) {
        console.error('Backend update failed:', error);
        // If save fails, revert the changes
        playlist.liked = !playlist.liked;
        if (playlist.liked) {
            playlist.likeCount++;
        } else {
            playlist.likeCount--;
        }

        // Revert UI
        if (playlist.liked) {
            likeButton.classList.add('liked');
            likeButton.textContent = '♥';
        } else {
            likeButton.classList.remove('liked');
            likeButton.textContent = '♡';
        }
        likeCountSpan.textContent = playlist.likeCount;

        alert('Failed to save like. Please try again.');
    }
}

// Tab switching
tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        if (index === 0) {
            // Featured tab - hide sort bar
            sortBar.style.display = "none";
            renderFeaturedView();
        } else {
            // All tab - show sort bar
            sortBar.style.display = "block";
            renderAllView();
        }
    });
});

/**
 * Search playlists by name or author
 *
 * Takes in: searchTerm (string) - the search query
 * Returns: array of playlists that match the search term
 * Searches through: playlist name and author fields
 */
function searchPlaylists(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
        return playlistsData;
    }

    const query = searchTerm.toLowerCase().trim();

    return playlistsData.filter(playlist => {
        const nameMatch = playlist.name.toLowerCase().includes(query);
        const authorMatch = playlist.author.toLowerCase().includes(query);
        return nameMatch || authorMatch;
    });
}

/**
 * Sort playlists based on the selected criteria
 *
 * Takes in: playlists (array) - array of playlist objects
 *           sortBy (string) - sorting criteria: 'default', 'likes', or 'az'
 * Returns: sorted array of playlists
 */
function sortPlaylists(playlists, sortBy) {
    const sorted = [...playlists]; // Create a copy to avoid mutating original

    switch (sortBy) {
        case 'likes':
            // Sort by like count (descending - highest first)
            sorted.sort((a, b) => b.likeCount - a.likeCount);
            break;
        case 'az':
            // Sort alphabetically by name (A-Z)
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'default':
        default:
            // Return original order (no sorting)
            break;
    }

    return sorted;
}

/**
 * Perform search and update the display
 */
function performSearch() {
    const searchTerm = searchInput.value.trim();
    console.log("Searching for:", searchTerm);

    // Get filtered results
    const results = searchPlaylists(searchTerm);
    console.log("Found", results.length, "playlists");

    // Make sure "All" tab is active when searching
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabButtons[1].classList.add("active"); // Activate "All" tab

    // Apply current sort
    const sortBy = sortSelect.value;
    const sortedResults = sortPlaylists(results, sortBy);

    // Render filtered and sorted results
    renderAllView(sortedResults);
}

// Search bar toggle
searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("hidden");

    // Focus on input when search bar opens
    if (!searchBar.classList.contains("hidden")) {
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }
});

// Clear button functionality
clearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();

    // Reset to show all playlists (with current sort applied)
    renderAllView();
});

// Search button functionality
searchButton.addEventListener("click", () => {
    performSearch();
});

// Allow Enter key to trigger search
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        performSearch();
    }
});

// Sort dropdown functionality
sortSelect.addEventListener("change", () => {
    console.log("Sort changed to:", sortSelect.value);

    // Check which tab is active
    const activeTab = document.querySelector('.tab-button.active');
    const isFeaturedTab = activeTab && activeTab.dataset.view === 'featured';

    // Only apply sorting to "All" view
    if (!isFeaturedTab) {
        // If there's a search active, re-run the search with new sort
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            performSearch();
        } else {
            // Otherwise, just re-render all playlists with new sort
            renderAllView();
        }
    }
});

// Menu dropdown functionality
menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!dropdownMenu.classList.contains("hidden") &&
        !menuButton.contains(event.target) &&
        !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
    }
});

// Edit playlist button functionality
if (editPlaylistButton) {
    editPlaylistButton.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("Edit Playlist clicked");
        console.log("Current playlist ID:", currentPlaylistID);

        // Toggle edit mode
        isEditMode = !isEditMode;

        // Re-render the song list with edit mode
        const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
        if (playlist) {
            const songs = resolveSongs(playlist.songs);
            songList.innerHTML = buildSongRows(songs);

            // Set up event listeners for remove buttons if in edit mode
            if (isEditMode) {
                setupEditModeListeners();
                enablePlaylistDetailsEditing();
            } else {
                disablePlaylistDetailsEditing();
            }
        }

        dropdownMenu.classList.add("hidden");
    });
} else {
    console.error('Edit playlist button not found!');
}

// Delete playlist button functionality
if (deletePlaylistButton) {
    deletePlaylistButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        console.log('Delete button clicked!');

        if (!currentPlaylistID) {
            console.error('No playlist selected');
            return;
        }

        // Confirm deletion
        const playlist = playlistsData.find(p => p.playlistID === currentPlaylistID);
        if (!playlist) {
            console.error('Playlist not found in data');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`)) {
            dropdownMenu.classList.add("hidden");
            return;
        }

        try {
            console.log('Deleting playlist:', currentPlaylistID);

            // Delete from backend
            await deletePlaylist(currentPlaylistID);

            // Remove from local data
            const index = playlistsData.findIndex(p => p.playlistID === currentPlaylistID);
            if (index !== -1) {
                playlistsData.splice(index, 1);
            }

            // Close the modal and dropdown
            closeModal();
            dropdownMenu.classList.add("hidden");

            // Re-render the view
            // Check which tab is currently active
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab.dataset.view === 'featured') {
                renderFeaturedView();
            } else {
                renderAllView();
            }

            console.log('Playlist deleted successfully');
        } catch (error) {
            console.error('Failed to delete playlist:', error);
            alert('Failed to delete playlist. Please try again.');
            dropdownMenu.classList.add("hidden");
        }
    });
} else {
    console.error('Delete playlist button not found!');
}

// Set up global event delegation for playlist cards (only once)
function setupCardEventDelegation() {

    appContent.addEventListener("click", (event) => {
        // Check if clicked on like button or like container first
        const likeButton = event.target.closest(".like-button");
        const likeContainer = event.target.closest(".like-container");

        if (likeButton) {
            event.preventDefault();
            event.stopPropagation();
            const playlistID = likeButton.dataset.playlistId;
            toggleLike(playlistID);
            return;
        }

        // Don't open modal if clicking anywhere in the like container
        if (likeContainer) {
            return;
        }

        // Check if clicked on a playlist card
        const card = event.target.closest(".playlist-card");
        if (card) {
            const playlistID = card.dataset.playlistId;
            if (playlistID) {
                openModal(playlistID);
            }
        }
    });
}

// Initialize app - load data and render initial view
async function initializeApp() {
    await loadPlaylistData();
    setupCardEventDelegation(); // Set up event delegation once
    sortBar.style.display = "block"; // Show sort bar since "All" tab is active by default
    renderAllView(); // Start with "All" tab active
}

// Run initialization when page loads
initializeApp();

