const PUBLIC_ADDR = 'tiktokmusic.normbrak.com';
const FETCH_URL = `https://${PUBLIC_ADDR}/data`;

document.addEventListener('DOMContentLoaded', function() {
    const vidUpldButton = document.getElementById("upload-form");
    const addTagButton = document.getElementById('add-tag-button');
    const tagInput = document.getElementById('tag-input');
    const tagsContainer = document.getElementById('tags');
    const searchButton = document.querySelector('.search-button');
    const musicRecommendations = document.querySelector('.music-recommendations');
    const musicCardsContainer = document.getElementById('music-cards');
    const loadingElement = document.getElementById('loading');
    const loadingNotice = document.getElementById('loading-notice'); // New loading notice element

    const musicBar = document.getElementById('music-bar');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongAuthor = document.getElementById('current-song-author');
    const progressBar = document.getElementById('progress-bar');

    const tagInvalidNotice = document.getElementById('tag_invalid_notice');
    const noResultNotice = document.getElementById('no_result_notice');
    const uploadStatus = document.getElementById('upload-status');
    const identifiedMusicDetails = document.getElementById('identified-music-details');
    const modal = document.getElementById('identified-music-modal');
    const closeModal = document.querySelector('.close');

    let currentSongIndex = 0;
    let songs = null;
    let audio = new Audio();
    let videoFile = null;

    // *----tag related----*
    function addTag(tag) {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `<span>#${tag}</span><span class="remove-tag">&times;</span>`;
        tagsContainer.appendChild(tagElement);

        tagElement.querySelector('.remove-tag').addEventListener('click', function() {
            tagsContainer.removeChild(tagElement);
        });
    }

    // *----fetch data related----*
    function processMetadata(metadata) {
        return metadata.map(item => ({
            title: item.title,
            authorName: item.authorName,
            coverLarge: item.cover_large,
            playUrl: item.play_url,
            duration: item.duration,
            playCount: item.stats.playCount,
            diggCount: item.stats.diggCount,
            commentCount: item.stats.commentCount,
            shareCount: item.stats.shareCount,
            score: calculateScore(item.stats)
        })).sort((a, b) => b.score - a.score);
    }
    
    
    

    function calculateScore(stats) {
        return stats.playCount + stats.diggCount * 2 + stats.commentCount * 3 + stats.shareCount * 4;
    }

    // *----music card related----*
    function truncateText(text, maxWords) {
        length = text.length;
        if (length > maxWords) {
            return text.substring(0, maxWords) + '...';
        }
        return text;
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    function createMusicCard(song) {
        const card = document.createElement('div');
        card.className = 'music-card';

        const img = document.createElement('img');
        img.src = song.coverLarge;
        img.alt = song.title;

        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        const title = document.createElement('h3');
        title.textContent = truncateText(song.title, 15);
        titleContainer.appendChild(title);

        const authorContainer = document.createElement('div');
        authorContainer.className = 'author-container';
        const author = document.createElement('p');
        author.textContent = `Author: ${truncateText(song.authorName, 15)}`;
        authorContainer.appendChild(author);

        const duration = document.createElement('p');
        duration.textContent = `Duration: ${song.duration} sec`;

        const playCount = document.createElement('p');
        playCount.textContent = `Played: ${formatNumber(song.playCount)}`;

        const diggCount = document.createElement('p');
        diggCount.textContent = `Digged: ${formatNumber(song.diggCount)}`;

        const playDiggContainer = document.createElement('div');
        playDiggContainer.className = 'play-digg-container';
        playDiggContainer.appendChild(playCount);
        playDiggContainer.appendChild(diggCount);

        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.onclick = function() {
            playSong(song);
        };

        const identifyButton = document.createElement('button');
        identifyButton.textContent = 'Identify Music';
        identifyButton.onclick = function() {
            identifyMusic(song.playUrl);
        };

        const demoButton = document.createElement('button');
        demoButton.textContent = 'Demo';
        demoButton.onclick = function() {
            if (videoFile == null){
                alert('Please upload a video first.');
                return;
            }
            playDemo(song);
        }; 

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(playButton);
        buttonContainer.appendChild(identifyButton);
        // buttonContainer.appendChild(demoButton);
        card.appendChild(img);
        card.appendChild(titleContainer);
        card.appendChild(authorContainer);
        card.appendChild(duration);
        card.appendChild(playDiggContainer);
        card.appendChild(buttonContainer); 

        return card;
    }

    function formatDuration(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function identifyMusic(playUrl) {
        loadingNotice.style.display = 'block'; // Show the loading notice
    
        fetch(playUrl)
            .then(response => response.blob())
            .then(blob => {
                const formData = new FormData();
                formData.append('file', blob, 'audio.mp3');
    
                return fetch('https://music.recognition.normbrak.com:8443/identify', {
                    method: 'POST',
                    body: formData
                });
            })
            .then(response => response.json())
            .then(data => {
                console.log('Identify Music Response:', data);
                loadingNotice.style.display = 'none'; // Hide the loading notice
    
                if (data.error) {
                    alert(data.error);  // Display error message if any
                    return;
                }
    
                if (data.length > 0) {
                    identifiedMusicDetails.innerHTML = '';
                    data.forEach(item => {
                        identifiedMusicDetails.innerHTML += `
                            <div class="identified-music-section">
                                <h3>Spotify</h3>
                                <img src="${item.spotify?.tracks.items[0]?.album.images[0]?.url || ''}" alt="Cover Image" class="cover-img">
                                <p><strong>Title:</strong> ${item.spotify?.tracks.items[0]?.name || 'N/A'}</p>
                                <p><strong>Artists:</strong> ${item.spotify?.tracks.items[0]?.artists.map(artist => artist.name).join(', ') || 'N/A'}</p>
                                <p><strong>Album:</strong> ${item.spotify?.tracks.items[0]?.album.name || 'N/A'}</p>
                                <p><strong>Release Date:</strong> ${item.spotify?.tracks.items[0]?.album.release_date || 'N/A'}</p>
                                <p><strong>Duration:</strong> ${formatDuration(item.spotify?.tracks.items[0]?.duration_ms) || 'N/A'}</p>
                                <p><strong>Link:</strong> ${item.spotify?.tracks.items[0]?.external_urls.spotify ? `<a href="${item.spotify?.tracks.items[0]?.external_urls.spotify}" target="_blank"><button>Spotify</button></a>` : 'N/A'}</p>
                            </div>
                            <hr>
                            <div class="identified-music-section">
                                <h3>YouTube</h3>
                                <img src="${item.youtube?.items[0]?.snippet.thumbnails.high.url || ''}" alt="Cover Image" class="cover-img">
                                <p><strong>Title:</strong> ${item.youtube?.items[0]?.snippet.title || 'N/A'}</p>
                                <p><strong>Channel:</strong> ${item.youtube?.items[0]?.snippet.channelTitle || 'N/A'}</p>
                                <p><strong>Description:</strong> ${item.youtube?.items[0]?.snippet.description || 'N/A'}</p>
                                <p><strong>Publish Date:</strong> ${item.youtube?.items[0]?.snippet.publishedAt || 'N/A'}</p>
                                <p><strong>Link:</strong> ${item.youtube?.items[0]?.id.videoId ? `<a href="https://www.youtube.com/watch?v=${item.youtube.items[0].id.videoId}" target="_blank"><button>YouTube</button></a>` : 'N/A'}</p>
                            </div>
                            <hr>
                            <div class="identified-music-section">
                                <h3>Apple Music</h3>
                                <img src="${item.apple_music.data[0]?.attributes.artwork?.url.replace('{w}x{h}', '300x300') || ''}" alt="Cover Image" class="cover-img">
                                <p><strong>Title:</strong> ${item.apple_music.data[0]?.attributes.name || 'N/A'}</p>
                                <p><strong>Artists:</strong> ${item.apple_music.data[0]?.attributes.artistName || 'N/A'}</p>
                                <p><strong>Album:</strong> ${item.apple_music.data[0]?.attributes.albumName || 'N/A'}</p>
                                <p><strong>Release Date:</strong> ${item.apple_music.data[0]?.attributes.releaseDate || 'N/A'}</p>
                                <p><strong>Duration:</strong> ${formatDuration(item.apple_music.data[0]?.attributes.durationInMillis) || 'N/A'}</p>
                                <p><strong>Link:</strong> ${item.apple_music.data[0]?.attributes.url ? `<a href="${item.apple_music.data[0]?.attributes.url}" target="_blank"><button>Apple Music</button></a>` : 'N/A'}</p>
                        </div>
                        `;
                    });
                    identifiedMusicDetails.style.display = 'block';
                    modal.style.display = 'block';
                } else {
                    identifiedMusicDetails.innerHTML = '<p>No music identified.</p>';
                    identifiedMusicDetails.style.display = 'block';
                    modal.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error identifying music:', error);
                loadingNotice.style.display = 'none'; // Hide the loading notice
            });
    }

    

    closeModal.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

/*     function playDemo(song) {
        const audioUrl = song.playUrl; 
        const videoUrl = URL.createObjectURL(videoFile);
    
        const demoWindow = window.open('', '_blank');
        if (demoWindow) {
            demoWindow.document.open();
            demoWindow.document.write(`
                <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Video demo</title>
                <style>
                    #audioElement {
                        display: none; 
                    }
                </style>
                <link rel="stylesheet" href="demo.css">
            </head>
            <body>
                <div>
                    <video id="videoElement" width="640" height="360">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div>
                    <audio id="audioElement" controls>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio tag.
                    </audio>
                </div>

                <div class="button-container">
                    <button id="playPauseButton">Play/Pause</button>
                </div>
    
                <script>
                    const video = document.getElementById('videoElement');
                    const audio = document.getElementById('audioElement');
                    const playPauseButton = document.getElementById('playPauseButton');
                    let isPlaying = false;
    
                    playPauseButton.addEventListener('click', function() {
                        if (!isPlaying) {
                            video.play();
                            audio.play();
                            playPauseButton.textContent = 'Pause';
                            isPlaying = true;
                        } else {
                            video.pause();
                            audio.pause();
                            playPauseButton.textContent = 'Play';
                            isPlaying = false;
                        }
                    });

                    video.addEventListener('ended', function() {
                        audio.currentTime = 0; 
                        audio.pause();
                        playPauseButton.textContent = 'Play';
                        isPlaying = false;
                    });

                    audio.addEventListener('ended', function() {
                        audio.currentTime = 0; 
                        video.pause();
                        playPauseButton.textContent = 'Play';
                        isPlaying = false;
                    });
                </script>
            </body>
            </html>
            `);
            demoWindow.document.close();
        } else {
            alert('Popup blocked! Please allow popups to view the demo.');
        }
    } */

/*     function downloadSong(url, title) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${title}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => console.error('Error downloading the song:', error));
    } */
    
    function playSong(song) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = song.playUrl;
        audio.play();
        currentSongTitle.textContent = song.title;
        currentSongAuthor.textContent = song.authorName;
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        currentSongIndex = songs.indexOf(song);
        
        musicBar.style.display = 'flex';
        
        audio.addEventListener('timeupdate', function() {
            progressBar.value = (audio.currentTime / audio.duration) * 100;

            // Update current time and total time
        const currentMinutes = Math.floor(audio.currentTime / 60);
        const currentSeconds = Math.floor(audio.currentTime % 60);
        const totalMinutes = Math.floor(audio.duration / 60);
        const totalSeconds = Math.floor(audio.duration % 60);
    
        document.getElementById('current-time').textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
        document.getElementById('total-time').textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;

        });

        
    }

/*     vidUpldButton.addEventListener('submit', function(event) {
        event.preventDefault();

        const fileInput = document.getElementById('video-file');
        videoFile = fileInput.files[0];
        uploadStatus.textContent = `Video "${videoFile.name}" uploaded successfully.`;
        uploadStatus.style.display = 'block';
    }); */

    addTagButton.addEventListener('click', function() {
        const tag = tagInput.value.trim();
        if (tag === '') {
            alert('Please enter a tag');
            return;
        }
        addTag(tag);
        tagInput.value = '';
    });

    searchButton.addEventListener('click', function() {
        const tags = Array.from(tagsContainer.getElementsByClassName('tag')).map(tagElement => 
            tagElement.textContent.replace('×', '').trim()
        );
        let inputString = tags.join(' ');
        console.log("the input tag is: ",inputString);

        const regex = /[a-zA-Z0-9]/;
        if (!regex.test(inputString)) {
            tagInvalidNotice.textContent = 'Please enter a valid tag'; 
            return;
        }
        
        tagInvalidNotice.textContent = '';
        noResultNotice.textContent = '';
        
        loadingElement.style.display = 'block';

        fetch(FETCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputString }),
        })
        .then(response => response.json())
        .then(metadata => {
            musicCardsContainer.innerHTML = '';
            loadingElement.style.display = 'none';
            songs = processMetadata(metadata.data);
            songs.forEach(song => {
                const card = createMusicCard(song);
                musicCardsContainer.appendChild(card);
            });
            musicRecommendations.style.display = 'block';
        }).catch(error => {
            loadingElement.style.display = 'none';
            console.error('Error fetching data:', error)
            musicRecommendations.style.display = 'none';
            noResultNotice.textContent = 'Oops, seems like no result on this tag'; 
        });
    });

    playPauseButton.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    prevButton.addEventListener('click', function() {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playSong(songs[currentSongIndex]);
        }
    });

    nextButton.addEventListener('click', function() {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playSong(songs[currentSongIndex]);
        }
    });

    progressBar.addEventListener('input', function() {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    });
});
