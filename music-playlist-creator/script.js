const playlistModal = document.getElementById("playlistModal");
const closeButton = document.querySelector(".close");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");
const shuffleButton = document.getElementById("shuffleButton");
const tabButtons = document.querySelectorAll(".tab-button");
const appContent = document.querySelector(".app-content");

// Store fetched playlist data globally
let playlistsData = [];

/**
 * Fetches playlist data from backend API
 *
 * Takes in: Nothing (fetches from backend API)
 * Returns: Promise<Array> - array of playlist objects
 * DOM element it appends to: .playlist-grid (via renderAllView)
 * Fields used: playlistID, name, cover, author, likeCount, liked, songs
 */
async function loadPlaylistData() {
    try {
        // Fetch data from backend API
        const response = await fetch('http://localhost:8080/api/playlists');
        const data = await response.json();
        playlistsData = data.playlists;

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
 * Builds song rows HTML from playlist songs array in data.json
 *
 * Takes in: songs (array) - array of song objects from data.json
 * Returns: string - HTML string of song rows
 * DOM element it appends to: returned HTML is inserted into #songList by openModal()
 * Fields used from each song: title, artist, album, duration, cover
 */
function buildSongRows(songs) {
    if (!songs || songs.length === 0) {
        return '<p>No songs available</p>';
    }

    console.log('Building song rows for songs:', songs);

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
    console.log('Opening modal for playlistID:', playlistID);
    console.log('Available playlists:', playlistsData);

    // Find the playlist in the loaded data
    const playlist = playlistsData.find(p => p.playlistID === playlistID);

    if (!playlist) {
        console.error('Playlist not found:', playlistID);
        console.error('Available playlist IDs:', playlistsData.map(p => p.playlistID));
        return;
    }

    console.log('Found playlist:', playlist);

    // Update modal with playlist data from data.json
    playlistName.textContent = playlist.name;
    playlistImage.src = playlist.cover;
    playlistImage.alt = `Cover art for ${playlist.name}`;
    playlistCreator.textContent = playlist.author;

    // Build and insert song rows using songs array from data.json
    songList.innerHTML = buildSongRows(playlist.songs);

    // Set up shuffle button for this playlist
    setupShuffleButton(playlist);

    playlistModal.style.display = "block";
    playlistModal.setAttribute("aria-hidden", "false");
}

/**
 * Sets up the shuffle button for the current playlist
 *
 * Takes in: playlist (object) - the playlist object with songs array
 * Returns: nothing
 * DOM element it updates: #songList (re-renders with shuffled songs)
 */
function setupShuffleButton(playlist) {
    // Remove any existing listeners by cloning the button
    const newShuffleButton = shuffleButton.cloneNode(true);
    shuffleButton.parentNode.replaceChild(newShuffleButton, shuffleButton);

    // Update the global reference
    const updatedShuffleButton = document.getElementById("shuffleButton");

    // Add click listener
    updatedShuffleButton.addEventListener("click", (event) => {
        event.preventDefault();

        // Shuffle the songs
        const shuffledSongs = shuffleArray(playlist.songs);

        // Re-render the song list with shuffled order
        songList.innerHTML = buildSongRows(shuffledSongs);
    });
}

function closeModal() {
    playlistModal.style.display = "none";
    playlistModal.setAttribute("aria-hidden", "true");
}

if (closeButton) {
    closeButton.addEventListener("click", closeModal);
}

if (playlistModal) {
    playlistModal.addEventListener("click", (event) => {
        if (event.target === playlistModal) {
            closeModal();
        }
    });
}

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

    const songRows = featuredPlaylist.songs.map((song) => `
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
function renderAllView() {
    const playlistCards = playlistsData.map(playlist => `
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

    attachCardListeners();
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

    // Prevent unliking if already at 0 likes
    if (!playlist.liked && playlist.likeCount === 0) {
        console.log('Cannot unlike - like count is already 0');
        return;
    }

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
            playlist.liked = false;
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

// Attach click listeners to playlist cards
function attachCardListeners() {
    const cards = document.querySelectorAll(".playlist-card");

    cards.forEach((card) => {
        // Handle like button clicks
        const likeButton = card.querySelector(".like-button");
        likeButton.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default button behavior
            event.stopPropagation(); // Prevent card click from firing
            const playlistID = likeButton.dataset.playlistId;
            toggleLike(playlistID);
        });

        // Handle card clicks (open modal)
        card.addEventListener("click", () => {
            const playlistID = card.dataset.playlistId;
            openModal(playlistID);
        });
    });
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

// Initialize app - load data and render initial view
async function initializeApp() {
    await loadPlaylistData();
    renderAllView(); // Start with "All" tab active
}

// Run initialization when page loads
initializeApp();

