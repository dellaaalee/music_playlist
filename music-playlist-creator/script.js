const playlistModal = document.getElementById("playlistModal");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");
const shuffleButton = document.getElementById("shuffleButton");
const tabButtons = document.querySelectorAll(".tab-button");
const appContent = document.querySelector(".app-content");

// Search bar elements
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");

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

// Store fetched data globally
let playlistsData = [];
let songsData = {};
let currentPlaylistID = null; // Track the currently open playlist in modal

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
    if (!songs || songs.length === 0) {
        return '<p>No songs available</p>';
    }

    return songs.map((song) => `
        <div class="song-row">
            <div class="song-meta">
                <img class="song-thumb" src="${song.cover}" alt="Cover art for ${song.title}">
                <div class="song-text">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-album">${song.album}</p>
                </div>
            </div>
            <p class="song-duration">${song.duration}</p>
        </div>
    `).join("");
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

function closeModal() {
    playlistModal.style.display = "none";
    playlistModal.setAttribute("aria-hidden", "true");
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
        closeModal();
    }
});

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
    const playlistsToRender = filteredPlaylists || playlistsData;

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
            renderFeaturedView();
        } else {
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

    // Render filtered results
    renderAllView(results);
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

    // Reset to show all playlists
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
        // TODO: Add edit playlist functionality here
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
    renderAllView(); // Start with "All" tab active
}

// Run initialization when page loads
initializeApp();

