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
#### Dynamically Create Playlist Cards:
What does this function take in?
My function takes in the data.json file
What does it return or produce?
It produces rendered playlist card in the DOM
What DOM element does it append to?
DOM append to playlist grid or app content 
What fields from the playlist object does it use? 
It uses playlistlistID, name, cover, author, likeCount, liked. 

#### Modal Population Function:
Add a function spec for your modal population function to planning.md. Your spec should answer:
What does this function take in?
Which DOM elements does it update?
What should the modal look like when the function has finished running?
What information needs to be present?


#### Shuffle function:
What does this function take in?
It takes in the song playlist, specifically song array in each playlist. 
What does it return?
It's going to return the shuffled order of songs in the array.
Should the original song order be preserved anywhere, and if so, how?
The order of the song would not be changed in the database or data.json, it would change in the display.
What does the UI look like after shuffling?
The UI will change because the song order will change. 
What should happen when the user clicks shuffle multiple times?
If a user clicks shuffle multiple time, the order of the song will change. The order of the song would just keep changing. 


#### Featured Page
The layout of the page — what sections exist, what goes where.
The feature page will randomly select and display a playlist. The playlist will have enlarged cover image and playlist name and the song list on the right. The feature page can be accessed through navbar, the page will be defaulted to "all" tab when the user refreshes the page. 
A function spec for your random playlist selection function: what does it take in, what does it return, and when does it run?
Featured page function will take in data from data.json and randomly select one playlist to display the data on the page. 
How navigation between the Featured page and the All Playlists page will work.
The navgiation between featured page and all playlist page will be done through the navbar next to the header. 

#### get playlist description
What does this function take in?
What does it return?
What API does it call and with what prompt structure?
What happens on error?

### AI Feature Spec (Milestone 8)
Role: What role should the model play?
Task: What is the model being asked to do? (generating a description for a music playlist based on its name, author, and song list)
Inputs: What playlist data will you pass to the model?
Output format: What should the response look like? (e.g., 2–3 sentence description that captures the vibe and theme of the playlist)
Constraints: What should the model avoid? (e.g., don't list the songs individually, don't use generic marketing language)
Failure behavior: What should the UI show if the API call fails or the model doesn't respond?

### Decisions Log
Milestone 1:


