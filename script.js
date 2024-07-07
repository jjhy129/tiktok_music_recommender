const PUBLIC_ADDR = 'ec2-35-90-200-252.us-west-2.compute.amazonaws.com';
const PORT = '8888';
const FETCH_URL = `http://${PUBLIC_ADDR}:${PORT}/data`;

document.addEventListener('DOMContentLoaded', function() {
    const addTagButton = document.getElementById('add-tag-button');
    const tagInput = document.getElementById('tag-input');
    const tagsContainer = document.getElementById('tags');
    const searchButton = document.querySelector('.search-button');
    const musicRecommendations = document.querySelector('.music-recommendations');
    const musicCardsContainer = document.getElementById('music-cards');
    const loadingElement = document.getElementById('loading');
    
    const musicBar = document.getElementById('music-bar');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongAuthor = document.getElementById('current-song-author');
    const progressBar = document.getElementById('progress-bar');

    const tagInvalidNotice = document.getElementById('tag_invalid_notice');
    const noResultNotice = document.getElementById('no_result_notice');
    
    let currentSongIndex = 0;
    let songs = null;
    let audio = new Audio();

    addTagButton.addEventListener('click', function() {
        const tag = tagInput.value.trim();
        if (tag === '') {
            alert('Please enter a tag');
            return;
        }
        addTag(tag);
        tagInput.value = '';
    });

    function addTag(tag) {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `<span>#${tag}</span><span class="remove-tag">&times;</span>`;
        tagsContainer.appendChild(tagElement);

        tagElement.querySelector('.remove-tag').addEventListener('click', function() {
            tagsContainer.removeChild(tagElement);
        });
    }

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
        inputString += " #music"
        
        //clear previous notice 
        tagInvalidNotice.textContent = '';
        noResultNotice.textContent = '';
        
        loadingElement.style.display = 'block';

        // fetch metadata based on tag
        fetch(FETCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputString }),
        })
        .then(response => response.json())
        .then(metadata => {
            // Clear previous recommendations
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

    function createMusicCard(song,idx) {
        const card = document.createElement('div');
        card.className = 'music-card';

        const img = document.createElement('img');
        img.src = song.coverLarge;
        img.alt = song.title;

        const title = document.createElement('h3');
        title.textContent = song.title;

        const author = document.createElement('p');
        author.textContent = `Author: ${song.authorName}`;

        const playCount = document.createElement('p');
        playCount.textContent = `Play Count: ${song.playCount}`;

        const diggCount = document.createElement('p');
        diggCount.textContent = `Digg Count: ${song.diggCount}`;

        const commentCount = document.createElement('p');
        commentCount.textContent = `Comment Count: ${song.commentCount}`;

        const shareCount = document.createElement('p');
        shareCount.textContent = `Share Count: ${song.shareCount}`;

        const duration = document.createElement('p');
        duration.textContent = `Duration: ${song.duration} sec`;
        
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.onclick = function() {
            playSong(song);
        };

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.onclick = function() {
            downloadSong(song.playUrl, song.title);
        };

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(playCount);
        card.appendChild(diggCount);
        card.appendChild(commentCount);
        card.appendChild(shareCount);
        card.appendChild(duration);
        card.appendChild(playButton);
        card.appendChild(downloadButton);

        return card;
    }
    function downloadSong(url, title) {
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
    }

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
        });
    }
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
