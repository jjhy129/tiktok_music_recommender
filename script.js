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
    const tagInvalidNotice = document.getElementById('tag_invalid_notice');
    const noResultNotice = document.getElementById('no_result_notice');

    let currentPlaying = {
        audio: null,
        button: null
    };

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
        inputString += " #music"
        console.log("the input tag is: ",inputString);

        if (!/\w/.test(inputString)) {
            tagInvalidNotice.textContent = 'Please enter a valid tag'; 
            return;
        }
        //clear prev notice mesg
        tagInvalidNotice.textContent = '';
        noResultNotice.textContent = '';
        
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
            const musicCardsContainer = document.getElementById('music-cards');
            // Clear previous recommendations
            musicCardsContainer.innerHTML = '';
            
            const songs = processMetadata(metadata.data);
            songs.forEach(song => {
                const card = createMusicCard(song);
                musicCardsContainer.appendChild(card);
            });
        }).catch(error => {
            console.error('Error fetching data:', error)
            musicRecommendations.style.display = 'none';
            noResultNotice.textContent = 'Oops, seems like no result on this tag'; 
        });
        
        
        musicRecommendations.style.display = 'block';
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

    function createMusicCard(song) {
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

        const audioPlayer = document.createElement('audio');
        audioPlayer.src = song.playUrl;
        audioPlayer.controls = true; 
        audioPlayer.className = 'audio-player';
        
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.onclick = function() {
            if (currentPlaying.audio && currentPlaying.audio != audioPlayer) {
                currentPlaying.audio.pause();
                currentPlaying.audio.currentTime = 0;
                currentPlaying.button.textContent = 'Play';
            }
            
            if (audioPlayer.paused) {
                audioPlayer.play();
                playButton.textContent = 'Pause';
                currentPlaying.audio = audioPlayer;
                currentPlaying.button = this;
            } else {
                audioPlayer.pause();
                playButton.textContent = 'Play';
                currentPlaying.audio = null;
            }
        };

        const pauseButton = document.createElement('button');
        pauseButton.textContent = 'Pause';
        pauseButton.onclick = function() {
            audioPlayer.pause();
            playButton.textContent = 'Play';
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

        return card;
    }
});
