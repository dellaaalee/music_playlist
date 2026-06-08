const playlistModal = document.getElementById("playlistModal");
const closeButton = document.querySelector(".close");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");
const tabButtons = document.querySelectorAll(".tab-button");
const appContent = document.querySelector(".app-content");

// Store fetched playlist data globally
let playlistsData = [];

/**
 * Fetches playlist data from data.json and displays playlists on the frontend
 *
 * Takes in: Nothing (fetches from 'data/data.json')
 * Returns: Promise<Array> - array of playlist objects
 * DOM element it appends to: .playlist-grid (via renderAllView)
 * Fields used: playlistID, name, cover, author, likeCount, liked, songs
 */
async function loadPlaylistData() {
    try {
        const response = await fetch('data/data.json');
        const data = await response.json();
        playlistsData = data.playlists;
        return playlistsData;
    } catch (error) {
        console.error('Error loading playlist data:', error);
        return [];
    }
}

function buildSongRows(playlistName) {
    // Find the playlist by name in the loaded data
    const playlist = playlistsData.find(p => p.name === playlistName);
    const songs = playlist?.songs || [];

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

function openModal(playlist) {
    playlistName.textContent = playlist.name;
    playlistImage.src = playlist.imageUrl;
    playlistImage.alt = playlist.imageAlt;
    playlistCreator.textContent = playlist.creator;
    songList.innerHTML = buildSongRows(playlist.name);

    playlistModal.style.display = "block";
    playlistModal.setAttribute("aria-hidden", "false");
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
            <p class="like-count">${playlist.liked ? '♥' : '♡'} ${playlist.likeCount}</p>
        </article>
    `).join('');

    appContent.innerHTML = `
        <section class="playlist-grid" aria-label="Playlist cards">
            ${playlistCards}
        </section>
    `;

    attachCardListeners();
}

// Attach click listeners to playlist cards
function attachCardListeners() {
    const cards = document.querySelectorAll(".playlist-card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const image = card.querySelector(".cover-image");
            const title = card.querySelector(".playlist-title");
            const creator = card.querySelector(".creator-name");

            openModal({
                name: title.textContent,
                imageUrl: image.src,
                imageAlt: image.alt,
                creator: creator.textContent
            });
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

