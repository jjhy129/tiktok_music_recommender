document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.search-button');
    const musicRecommendations = document.querySelector('.music-recommendations');

    searchButton.addEventListener('click', function() {
        musicRecommendations.style.display = 'block';
    });
});
