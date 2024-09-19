document.addEventListener('DOMContentLoaded', function() {
    const videoInput = document.getElementById('video-input');
    const searchButton = document.querySelector('.search-button');
    const musicResults = document.getElementById('music-results');
    const loadingElement = document.getElementById('loading');
    const noResultNotice = document.getElementById('no_result_notice');

    function identifyMusicByUrl(videoUrl) {
        loadingElement.style.display = 'block'; // Show the loading notice
    
        const formData = new FormData();
        formData.append('video_url', videoUrl);

        fetch('https://music.recognition.normbrak.com:8443/identify_url', { // Example endpoint
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Identify Music Response:', data);
            loadingElement.style.display = 'none'; // Hide the loading notice
    
            if (data.error) {
                alert(data.error);  // Display error message if any
                return;
            }
    
            if (data.length > 0) {
                musicResults.innerHTML = ''; // Clear previous results
                data.forEach(item => {
                    musicResults.innerHTML += `
                        <div class="identified-music-section">
                            <h3>${item.title}</h3>
                            <p><strong>Artist:</strong> ${item.artistName}</p>
                            <p><strong>Album:</strong> ${item.albumName}</p>
                            <p><strong>Duration:</strong> ${item.duration}</p>
                        </div>
                        <hr>
                    `;
                });
                musicResults.style.display = 'block';
            } else {
                noResultNotice.textContent = 'No music identified.';
            }
        })
        .catch(error => {
            console.error('Error identifying music:', error);
            loadingElement.style.display = 'none';
            noResultNotice.textContent = 'Error occurred during identification.';
        });
    }

    searchButton.addEventListener('click', function() {
        const videoUrl = videoInput.value.trim();
        if (!videoUrl) {
            alert('Please enter a valid video URL or name.');
            return;
        }
        identifyMusicByUrl(videoUrl);
    });
});
