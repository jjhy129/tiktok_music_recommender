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
    const notice = document.getElementById('notice');

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
        tagElement.innerHTML = `<span>${tag}</span><span class="remove-tag">&times;</span>`;
        tagsContainer.appendChild(tagElement);

        tagElement.querySelector('.remove-tag').addEventListener('click', function() {
            tagsContainer.removeChild(tagElement);
        });
    }

    searchButton.addEventListener('click', function() {
        const tags = Array.from(tagsContainer.getElementsByClassName('tag')).map(tagElement => 
            tagElement.textContent.replace('×', '').trim()
        );
        const inputString = tags.join(' ');
        console.log(inputString);
        
        if (!/\w/.test(inputString)) {
            notice.textContent = 'Please enter a valid tag'; 
            return;
        }
        notice.textContent = '';
        
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
            
            // Process and display song recommendations
            const songs = processMetadata(metadata.data);
            songs.forEach(song => {
                const card = createMusicCard(song);
                musicCardsContainer.appendChild(card);
            });
        }).catch(error => console.error('Error fetching data:', error));
        
        // Show music recommendations section
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

        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.onclick = function() {
            window.open(song.playUrl, '_blank');
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
