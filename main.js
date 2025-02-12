const API_KEY = 'fed1080e';
        const BASE_URL = 'https://www.omdbapi.com/';

        // Router function to handle page rendering
        function router() {
            const path = window.location.pathname;
            const searchParams = new URLSearchParams(window.location.search);
            const imdbID = searchParams.get('id');

            if (imdbID) {
                renderMovieDetailsPage(imdbID);
            } else {
                renderHomePage();
            }
        }

        // Add navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        function renderHomePage() {
            document.getElementById('app').innerHTML = ` <nav class="navbar">
        <h1 class="app-title">NETFLIX</h1>
        <div class="nav-links">
            <a href="#">Movies</a>
            <a href="#">Series</a>
            <a href="#">News</a>
        </div>
    </nav>
    
    <div class="container">
        <div class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Unlimited movies, all in one place.</h1>
                <div class="search-section">
                    <div class="search-box">
                        <input type="text" id="searchInput" placeholder="Search for movies...">
                        <button onclick="searchMovies()">Search</button>
                    </div>
                    <div class="error-message" id="errorMessage"></div>
                </div>
            </div>
        </div>
        
        <div id="loading" class="loading" style="display: none;">
            Searching for movies...
        </div>
        
        <div class="movie-section">
            <h2 class="section-title">Search Results</h2>
            <div class="movie-grid" id="movieGrid"></div>
        </div>
    </div>
               
            `;

            // Load last search if exists
            const savedMovie = localStorage.getItem('lastSearchedMovie');
            if (savedMovie) {
                document.getElementById('searchInput').value = savedMovie;
                searchMovies();
            }
        }

        // Render movie details page
        async function renderMovieDetailsPage(imdbID) {
            document.getElementById('app').innerHTML = `
                <button class="back-button" onclick="goBack()">← Back to Search</button>
                <div id="movieDetails" class="movie-details">
                    <div id="movieDetailsContent" class="details-content">
                        Loading...
                    </div>
                </div>
            `;

            await getMovieDetails(imdbID);
        }

        function goBack() {
            window.history.back();
        }

        async function searchMovies() {
            const searchTerm = document.getElementById('searchInput').value.trim();
            if (!searchTerm) {
                showError('Please enter a movie title');
                return;
            }

            showLoading();
            
            try {
                const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${searchTerm}`);
                const data = await response.json();

                if (data.Response === 'False') {
                    showError(data.Error || 'No movies found');
                    hideLoading();
                    return;
                }

                displayMovies(data.Search);
                localStorage.setItem('lastSearchedMovie', searchTerm);
                hideError();
            } catch (error) {
                showError('Network error occurred. Please try again.');
            } finally {
                hideLoading();
            }
        }

        function displayMovies(movies) {
            const movieGrid = document.getElementById('movieGrid');
            movieGrid.innerHTML = '';

            movies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.onclick = () => navigateToMovie(movie.imdbID);

                const poster = movie.Poster === 'N/A' ? 'https://via.placeholder.com/300x450?text=No+Poster' : movie.Poster;
                
                movieCard.innerHTML = `
                    <img src="${poster}" alt="${movie.Title}" onerror="this.src='https://via.placeholder.com/300x450?text=Error+Loading+Image'">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.Title}</h3>
                        <p class="movie-year">${movie.Year}</p>
                    </div>
                `;

                movieGrid.appendChild(movieCard);
            });
        }

        function navigateToMovie(imdbID) {
            window.location.href = `?id=${imdbID}`;
        }

        async function getMovieDetails(imdbID) {
            try {
                const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
                const movie = await response.json();

                if (movie.Response === 'False') {
                    showError(movie.Error);
                    return;
                }

                const detailsContent = document.getElementById('movieDetailsContent');
                detailsContent.innerHTML = `
                    <div class="movie-hero" style="background-image: url(${movie.Poster})">
                        <div class="movie-hero-content">
                            <h1 style="font-size: 3rem; margin-bottom: 20px;">${movie.Title}</h1>
                            <p style="font-size: 1.2rem; color: #999;">${movie.Year} | ${movie.Runtime} | ${movie.Genre}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 300px 1fr; gap: 40px;">
                        <img src="${movie.Poster}" alt="${movie.Title}" style="width: 100%; border-radius: 8px;">
                        <div>
                            <p style="font-size: 1.2rem; margin-bottom: 20px;"><strong>IMDb Rating:</strong> ⭐ ${movie.imdbRating}</p>
                            <p style="line-height: 1.6; margin-bottom: 20px;">${movie.Plot}</p>
                            <p style="margin-bottom: 10px;"><strong>Director:</strong> ${movie.Director}</p>
                            <p style="margin-bottom: 10px;"><strong>Writers:</strong> ${movie.Writer}</p>
                            <p style="margin-bottom: 20px;"><strong>Cast:</strong> ${movie.Actors}</p>
                            <p><strong>Awards:</strong> ${movie.Awards}</p>
                        </div>
                    </div>
                `;

                // Update page title
                document.title = `${movie.Title} (${movie.Year}) - MovieFlix`;
            } catch (error) {
                showError('Error fetching movie details. Please try again.');
            }
        }

        function showError(message) {
            const errorElement = document.getElementById('errorMessage');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }

        function hideError() {
            const errorElement = document.getElementById('errorMessage');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }

        function showLoading() {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
                document.getElementById('movieGrid').innerHTML = '';
            }
        }

        function hideLoading() {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }

        // Initialize the router
        window.addEventListener('popstate', router);
        window.addEventListener('load', router);

        // Add event listener for search input
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'searchInput') {
                e.target.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchMovies();
                    }
                });
            }
        });