export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const API_KEY = process.env.TMDB_API_KEY;
    const API_URL = 'https://api.themoviedb.org/3';

    try {
        const { page = 1 } = req.query;

        const response = await fetch(
            `${API_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
        );

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter movies with posters
        const movies = data.results.filter(movie => movie.poster_path);

        res.status(200).json({
            success: true,
            movies: movies,
            totalPages: data.total_pages
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
