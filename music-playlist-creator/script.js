const playlistCards = document.querySelectorAll(".playlist-card");
const playlistModal = document.getElementById("playlistModal");
const closeButton = document.querySelector(".close");
const playlistName = document.getElementById("playlistName");
const playlistImage = document.getElementById("playlistImage");
const playlistCreator = document.getElementById("playlistCreator");
const songList = document.getElementById("songList");

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

function openModal(card) {
    const image = card.querySelector(".cover-image");
    const title = card.querySelector(".playlist-title");
    const creator = card.querySelector(".creator-name");

    playlistName.textContent = title.textContent;
    playlistImage.src = image.src;
    playlistImage.alt = image.alt;
    playlistCreator.textContent = creator.textContent;
    songList.innerHTML = buildSongRows(title.textContent);

    playlistModal.classList.add("show");
    playlistModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    playlistModal.classList.remove("show");
    playlistModal.setAttribute("aria-hidden", "true");
}

playlistCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
});

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

