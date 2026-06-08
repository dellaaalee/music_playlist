## Music Playlist Explorer — Planning Spec

### Data Shape
Playlist:
    - playlistID (string) — unique identifier used to reference a specific playlist
    - name (string) — the title of the playlist shown on the card and in the modal
    - cover (image) — path or URL to the playlist's cover art image
    - author (string) — name of the creator who made the playlist
    - likeCount (number) — number of likes the playlist has received
    - liked (boolean) — whether the current user has liked this playlist
    - songs (array of song) — the list of song objects that belong to this playlist

song:
    - songID (string) — unique identifier used to reference a specific song
    - title (string) — the name of the song
    - artist (string) — name of the performing artist
    - album (string) — name of the album the song appears on
    - duration (string, mm:ss) — length of the song in minutes and seconds
    - cover (image/string URL) — path or URL to the song's thumbnail/cover art

What does this function take in?
My function takes in the data.json file

What does it return or produce?
It produces rendered playlist card in the DOM

What DOM element does it append to?
DOM append to playlist grid or app content 

What fields from the playlist object does it use? 
It uses playlistlistID, name, cover, author, likeCount, liked. 





### UI and Interaction Rules
What are the main sections of the homepage?
The main section of the homepage has a playlist card shown in grid view. It has feature tab and all tab, feature tab randomly selects and displays a playlist. When the page is refreshed or reloaded in the feature page, a new random playlist is displayed. 

What happens when a user clicks a playlist card?
If the user clicks on a playlist card, it creates a modal pop up view that displays detailed information about a playlist including cover image, playlist name, author, list of songs, and a shuffle button. 

What happens when a user clicks outside the modal?
When a user clicks outside of the modal, it returns back to the homepage. 

What happens when a user clicks the like icon?
When a user clicks on the like icon, the like count increases by 1 and there is a visual feedback (where heart changes color) if previously unliked. If previously liked, the like count decreases by 1 and there’s a visual feedback showing the playlist has been unliked. 

What does the shuffle button do?
The shuffle button enables user to shuffle songs within a playlist or changing the order of the song that is being played. 


### Function Specs
[Add function specs here as you plan each milestone]

### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

### Decisions Log
[One entry per milestone where you make spec-informed decisions]

