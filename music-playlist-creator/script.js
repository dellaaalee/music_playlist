const playlistCards = document.querySelectorAll(".playlist-card");
const playlistModal = document.getElementById("playlistModal");
const closeButton = document.querySelector(".close");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");
const tabButtons = document.querySelectorAll(".tab-button");
const appContent = document.querySelector(".app-content");

function buildSongRows(title) {
    const songsByPlaylist = {
        "Chill Vibes": [
            { title: "Ocean Eyes", artist: "Billie Eilish", album: "Don't Smile at Me", duration: "3:20" },
            { title: "Pink + White", artist: "Frank Ocean", album: "Blonde", duration: "3:05" },
            { title: "Snooze", artist: "SZA", album: "SOS", duration: "3:21" }
        ],
        "Workout Hits": [
            { title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23" },
            { title: "Paint The Town Red", artist: "Doja Cat", album: "Scarlet", duration: "3:50" },
            { title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:19" }
        ]
    };

    const songs = songsByPlaylist[title] || [
        { title: "Song Title", artist: "Artist Name", album: "Album Name", duration: "0:00" },
        { title: "Song Title", artist: "Artist Name", album: "Album Name", duration: "0:00" },
        { title: "Song Title", artist: "Artist Name", album: "Album Name", duration: "0:00" }
    ];

    return songs.map((song) => `
        <div class="song-row">
            <div class="song-meta">
                <img class="song-thumb" src="https://picsum.photos/seed/${encodeURIComponent(song.title)}/80/80" alt="Cover art for ${song.title}">
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

// Featured playlist data
const featuredPlaylist = {
    name: "90's R&B",
    imageUrl: "https://picsum.photos/seed/90s-rnb/800/500",
    creator: "DJ Luna",
    songs: [
        { title: "No Diggity", artist: "Blackstreet ft. Dr. Dre", album: "Another Level", duration: "5:06", imageUrl: "https://picsum.photos/seed/no-diggity/80/80" },
        { title: "Waterfalls", artist: "TLC", album: "CrazySexyCool", duration: "4:39", imageUrl: "https://picsum.photos/seed/waterfalls/80/80" },
        { title: "Creep", artist: "TLC", album: "CrazySexyCool", duration: "4:29", imageUrl: "https://picsum.photos/seed/creep/80/80" },
        { title: "On Bended Knee", artist: "Boyz II Men", album: "II", duration: "4:05", imageUrl: "https://picsum.photos/seed/bended-knee/80/80" },
        { title: "Fantasy", artist: "Mariah Carey", album: "Daydream", duration: "4:04", imageUrl: "https://picsum.photos/seed/fantasy/80/80" }
    ]
};

// Render Featured view
function renderFeaturedView() {
    const songRows = featuredPlaylist.songs.map((song) => `
        <div class="featured-song-row">
            <img class="featured-song-thumb" src="${song.imageUrl}" alt="Cover art for ${song.title}">
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
                <img class="featured-image" src="${featuredPlaylist.imageUrl}" alt="Cover art for ${featuredPlaylist.name}">
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
    appContent.innerHTML = `
        <section class="playlist-grid" aria-label="Playlist cards">
            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/chill-vibes/420/240" alt="Cover art for Chill Vibes playlist">
                <h2 class="playlist-title">Chill Vibes</h2>
                <p class="creator-name">DJ Luna</p>
                <p class="like-count">♡ 5</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/workout-hits/420/240" alt="Cover art for Workout Hits playlist">
                <h2 class="playlist-title">Workout Hits</h2>
                <p class="creator-name">Kai Johnson</p>
                <p class="like-count">♡ 12</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/coffee-jazz/420/240" alt="Cover art for Coffee Jazz playlist">
                <h2 class="playlist-title">Coffee Jazz</h2>
                <p class="creator-name">Mia Chen</p>
                <p class="like-count">♡ 8</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/throwback-pop/420/240" alt="Cover art for Throwback Pop playlist">
                <h2 class="playlist-title">Throwback Pop</h2>
                <p class="creator-name">Ari Brooks</p>
                <p class="like-count">♡ 17</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/coding-focus/420/240" alt="Cover art for Coding Focus playlist">
                <h2 class="playlist-title">Coding Focus</h2>
                <p class="creator-name">Noah Kim</p>
                <p class="like-count">♡ 23</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/sunset-drive/420/240" alt="Cover art for Sunset Drive playlist">
                <h2 class="playlist-title">Sunset Drive</h2>
                <p class="creator-name">Zoe Carter</p>
                <p class="like-count">♡ 9</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/indie-discovery/420/240" alt="Cover art for Indie Discovery playlist">
                <h2 class="playlist-title">Indie Discovery</h2>
                <p class="creator-name">Sam Rivera</p>
                <p class="like-count">♡ 11</p>
            </article>

            <article class="playlist-card">
                <img class="cover-image" src="https://picsum.photos/seed/night-energy/420/240" alt="Cover art for Night Energy playlist">
                <h2 class="playlist-title">Night Energy</h2>
                <p class="creator-name">Leah Patel</p>
                <p class="like-count">♡ 14</p>
            </article>
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

// Initial load - attach listeners to existing cards on page
if (playlistCards.length > 0) {
    attachCardListeners();
}

