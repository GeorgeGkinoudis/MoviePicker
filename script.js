const API_KEY = '99c2ec9615e90b231ec070a0ea8bf5f6';
const API_URL = 'https://api.themoviedb.org/3';

let selectedMovies = [];
let categoryCounts = {};
let currentMovies = [];

// Initialize the app
async function init() {
    await loadMovies();
}

// Fetch random movies from the API
async function loadMovies() {
    try {
        // Get popular movies
        const response = await fetch(
            `${API_URL}/movie/popular?api_key=${API_KEY}&page=${Math.floor(Math.random() * 50) + 1}`
        );
        const data = await response.json();
        const movies = data.results.filter(movie => movie.poster_path);
        
        // Get two random movies
        currentMovies = [];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            currentMovies.push(movies[randomIndex]);
        }
        
        displayMovies();
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Display the current movies
function displayMovies() {
    const movie1 = currentMovies[0];
    const movie2 = currentMovies[1];
    
    document.getElementById('poster1').src = `https://image.tmdb.org/t/p/w500${movie1.poster_path}`;
    document.getElementById('title1').textContent = movie1.title;
    document.getElementById('poster2').src = `https://image.tmdb.org/t/p/w500${movie2.poster_path}`;
    document.getElementById('title2').textContent = movie2.title;
    
    // Add click handlers
    document.getElementById('movie1').onclick = () => selectMovie(0, movie1);
    document.getElementById('movie2').onclick = () => selectMovie(1, movie2);
}

// Handle movie selection
async function selectMovie(index, movie) {
    // Add to selected movies
    selectedMovies.push(movie);
    
    // Get the first genre as the category
    let category = 'Unknown';
    if (movie.genre_ids && movie.genre_ids.length > 0) {
        category = getGenreName(movie.genre_ids[0]);
    }
    
    // Count the category
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    // Add to bucket
    addToBucket(movie);
    
    // Update counter
    document.getElementById('counter').textContent = selectedMovies.length;
    
    if (selectedMovies.length === 5) {
        // Trigger explosion and show result
        triggerExplosion();
    } else {
        // Load new movies
        await loadMovies();
    }
}

// Add movie to bucket
function addToBucket(movie) {
    const bucket = document.getElementById('bucket');
    const bucketItem = document.createElement('div');
    bucketItem.className = 'bucket-item';
    
    const img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = movie.title;
    
    const title = document.createElement('p');
    title.textContent = movie.title;
    
    bucketItem.appendChild(img);
    bucketItem.appendChild(title);
    bucket.appendChild(bucketItem);
}

// Map genre IDs to names (TMDB genre IDs)
function getGenreName(genreId) {
    const genres = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Sci-Fi',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    };
    return genres[genreId] || 'Unknown';
}

// Trigger bucket explosion and show result
function triggerExplosion() {
    const bucket = document.getElementById('bucket');
    bucket.classList.add('explosion');
    
    setTimeout(() => {
        // Find the favorite category
        let favoriteCategory = 'Unknown';
        let maxCount = 0;
        
        for (const [category, count] of Object.entries(categoryCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteCategory = category;
            }
        }
        
        // Show result modal
        showResultModal(favoriteCategory);
    }, 600);
}

// Show result modal
function showResultModal(category) {
    const modal = document.createElement('div');
    modal.className = 'result-modal';
    
    const content = document.createElement('div');
    content.className = 'result-content';
    
    const title = document.createElement('h2');
    title.textContent = '💥 Bucket Exploded! 💥';
    
    const categoryText = document.createElement('p');
    categoryText.textContent = `Your Favorite Category: ${category}`;
    
    const button = document.createElement('button');
    button.textContent = 'Start Over';
    button.onclick = () => location.reload();
    
    content.appendChild(title);
    content.appendChild(categoryText);
    content.appendChild(button);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
}

// Start the app
init();
