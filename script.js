// 🔑 Paste your TMDB API key here:
const TMDB_API_KEY = "99c2ec9615e90b231ec070a0ea8bf5f6";
const TMDB_BASE = "https://api.themoviedb.org/3";

let selectedMovies = [];
let categoryCounts = {};
let currentMovies = [];

async function init() {
  await loadMovies();
}

async function loadMovies() {
  setLoadingState(true);
  try {
    const pageNum = Math.floor(Math.random() * 50) + 1;
    const response = await fetch(
      `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const movies = data.results.filter((m) => m.poster_path);

    if (movies.length < 2) {
      showError("Not enough movies available. Try again.");
      setLoadingState(false);
      return;
    }

    // Pick two distinct random movies
    const shuffled = movies.sort(() => Math.random() - 0.5);
    currentMovies = shuffled.slice(0, 2);

    displayMovies();
  } catch (error) {
    console.error("Error fetching movies:", error);
    showError("Failed to load movies. Please try again.");
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  const sections = ["movie1", "movie2"];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = isLoading ? "0.4" : "1";
  });

  // Disable clicks while loading
  document.getElementById("movie1").style.pointerEvents = isLoading
    ? "none"
    : "auto";
  document.getElementById("movie2").style.pointerEvents = isLoading
    ? "none"
    : "auto";
}

function showError(message) {
  const existing = document.getElementById("error-msg");
  if (existing) existing.remove();

  const err = document.createElement("p");
  err.id = "error-msg";
  err.textContent = message;
  err.style.cssText =
    "color:#ff6b6b; text-align:center; margin-top:10px; font-weight:bold;";
  document.querySelector("main").prepend(err);
}

function displayMovies() {
  const [movie1, movie2] = currentMovies;

  const poster1 = document.getElementById("poster1");
  const poster2 = document.getElementById("poster2");

  poster1.src = `https://image.tmdb.org/t/p/w500${movie1.poster_path}`;
  poster1.alt = movie1.title;
  document.getElementById("title1").textContent = movie1.title;

  poster2.src = `https://image.tmdb.org/t/p/w500${movie2.poster_path}`;
  poster2.alt = movie2.title;
  document.getElementById("title2").textContent = movie2.title;

  document.getElementById("movie1").onclick = () => selectMovie(movie1);
  document.getElementById("movie2").onclick = () => selectMovie(movie2);
}

async function selectMovie(movie) {
  selectedMovies.push(movie);

  let category = "Unknown";
  if (movie.genre_ids && movie.genre_ids.length > 0) {
    category = getGenreName(movie.genre_ids[0]);
  }

  categoryCounts[category] = (categoryCounts[category] || 0) + 1;

  addToBucket(movie);
  document.getElementById("counter").textContent = selectedMovies.length;

  if (selectedMovies.length === 5) {
    triggerExplosion();
  } else {
    await loadMovies();
  }
}

function addToBucket(movie) {
  const bucket = document.getElementById("bucket");
  const bucketItem = document.createElement("div");
  bucketItem.className = "bucket-item";

  const img = document.createElement("img");
  img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  img.alt = movie.title;

  const title = document.createElement("p");
  title.textContent = movie.title;

  bucketItem.appendChild(img);
  bucketItem.appendChild(title);
  bucket.appendChild(bucketItem);
}

function getGenreName(genreId) {
  const genres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  return genres[genreId] || "Unknown";
}

function triggerExplosion() {
  const bucket = document.getElementById("bucket");
  bucket.classList.add("explosion");

  setTimeout(() => {
    let favoriteCategory = "Unknown";
    let maxCount = 0;

    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    }

    showResultModal(favoriteCategory);
  }, 600);
}

function showResultModal(category) {
  const modal = document.createElement("div");
  modal.className = "result-modal";

  const content = document.createElement("div");
  content.className = "result-content";

  const title = document.createElement("h2");
  title.textContent = "💥 Bucket Exploded! 💥";

  const categoryText = document.createElement("p");
  categoryText.textContent = `Your Favourite Genre: ${category}`;

  const breakdown = document.createElement("div");
  breakdown.className = "category-breakdown";
  for (const [cat, count] of Object.entries(categoryCounts)) {
    const row = document.createElement("span");
    row.textContent = `${cat}: ${count}`;
    breakdown.appendChild(row);
  }

  const button = document.createElement("button");
  button.textContent = "Play Again";
  button.onclick = () => location.reload();

  content.appendChild(title);
  content.appendChild(categoryText);
  content.appendChild(breakdown);
  content.appendChild(button);
  modal.appendChild(content);

  document.body.appendChild(modal);
}

init();
