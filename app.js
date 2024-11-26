const API_KEY = '063b610b1cd4687cf40f4568384e106c';
const baseURL = `https://api.themoviedb.org/3`;
const imageBaseURL = 'https://image.tmdb.org/t/p/w500';
const comedyGenreID = 35; // ID du genre comédie dans TMDb (35)
const loginDialog = document.querySelector(".login-dialog");
const signinButton = document.getElementById("open-signin");
const registre = document.getElementById("open-register"); 
const closeButton = document.querySelector("#close-svg");

// =======================MODAL==============================================
signinButton.onclick = function() {
  loginDialog.style.display = "flex"; //Pour le centrer
};

registre.onclick = function() {
  loginDialog.style.display = "flex"
};

closeButton.onclick = function() {
  loginDialog.style.display = "none"; // Cache le modal
};

// =======================================================================

// les Meilleurs Notés
const fetchPopularMovies = async () => {
  try {
    const response = await fetch(`${baseURL}/movie/top_rated?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des films populaires :", error);
  }
};

// (les dernières sorties)
const fetchLatestMovies = async () => {
  try {
    const response = await fetch(`${baseURL}/movie/now_playing?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières sorties :", error);
  }
};

// Recherde de l'USER
const searchMovies = async (query) => {
  try {
    const response = await fetch(`${baseURL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la recherche de films :", error);
  }
};

const displaySearchResults = async (query) => {
  const movies = await searchMovies(query);
  const swiperWrapper = document.querySelector('.results__swiper .swiper-wrapper');
  const resultsTitle = document.querySelector('.results h2 span');

  // Mettre à jour le titre avec la requête de recherche
  resultsTitle.textContent = ` "${query}"`;
  swiperWrapper.innerHTML = '';

  if (swiperWrapper && movies) {
    movies.forEach(movie => {
      const slideElement = createMovieSlide(movie);
      swiperWrapper.appendChild(slideElement);
    });

    new Swiper('.results__swiper .swiper-container-result', {
      loop: true,
      slidesPerView: 4,
      spaceBetween: 1,
      navigation: {
        nextEl: '.results .swiper-button-next',
        prevEl: '.results .swiper-button-prev',
      },
    });
  }
};

// Fonction pour récupérer les films de comédie
const fetchComedyMovies = async () => {
  try {
    const response = await fetch(`${baseURL}/discover/movie?api_key=${API_KEY}&with_genres=${comedyGenreID}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des films de comédie :", error);
  }
};

// ============================TOOLTIP===================================================

// Fonction pour créer un slide avec un tooltip
const createMovieSlide = (movie) => {
  const slideElement = document.createElement('div');
  slideElement.classList.add('swiper-slide');

  // Fonction pour transformer les identifiants de genres en noms
  const mapGenres = (genreIds) => {
    const genreList = {
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
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western"
    
    };
    
    // Mappe les identifiants aux noms et joint les genres par des /
    return genreIds.map(id => genreList[id] || "Unknown").join(" / ");
  };

  slideElement.innerHTML = `
    <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}" class="movie-poster" />
    <div class="movie-info-tooltip">
      <h3>${movie.title}</h3>
      <p class="date_rel">${movie.release_date.substring(0, 4)}</p>
      <p class="genre">${mapGenres(movie.genre_ids)}</p> <!-- Appel de la fonction mapGenres -->
      <img src="etoile.svg" alt="Star" class="star-icon" />
      <p class="vote_average">${movie.vote_average.toFixed(1)}</p>
    </div>
  `;

  // Afficher le tooltip lors du survol
  const tooltip = slideElement.querySelector('.movie-info-tooltip');
  slideElement.addEventListener('mouseenter', () => {
    tooltip.style.display = 'flex';
  });

  // Cacher le tooltip lorsque le survol est terminé
  slideElement.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  slideElement.addEventListener('click', () => {
    showMoviePopup(movie); 
  
  });

  return slideElement;

};

// ===============================================================================

// Fonction pour afficher les films dans le Swiper
const displayMoviesInSwiper = async (fetchMoviesFunction, swiperSelector) => {
  const movies = await fetchMoviesFunction();
  const swiperWrapper = document.querySelector(`${swiperSelector} .swiper-wrapper`);

  if (swiperWrapper && movies) {
    movies.forEach(movie => {
      const slideElement = createMovieSlide(movie);
      swiperWrapper.appendChild(slideElement);
    });

    new Swiper(swiperSelector, {
      loop: true,
      slidesPerView: 4,
      spaceBetween: 1,
      navigation: {
        nextEl: `${swiperSelector} .swiper-button-next`,
        prevEl: `${swiperSelector} .swiper-button-prev`,
      },
    });
  }
};

// ============================POPUP MOVIE=======================================
  // Fonction pour transformer les identifiants de genres en noms
  const mapGenres = (genreIds) => {
    const genreList = {
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
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western"
    
    };
    
    // Mappe les identifiants aux noms et joint les genres par des /
    return genreIds.map(id => genreList[id] || "Unknown").join(" / ");
  };

// Fonction pour afficher les détails d'un film dans un popup
const showMoviePopup = async (movie) => {
  // Vérifiez si les acteurs sont déjà présents, sinon récupérez-les
  if (!movie.actors) {
    movie.actors = await fetchMovieActors(movie.id);
  }

  // Sélectionner ou créer l'élément du popup
  let popup = document.querySelector('.movie-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.classList.add('movie-popup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="popup-close">&times;</span>
        <img class="popup-poster" src="" alt="Movie Poster" />
        <div>
          <h2 class="popup-title"></h2>
          <p class="date_popup"></p>
          <img src="etoile.svg" alt="Star" class="star-iconModal" />
          <p class="vote_averagepop"></p>
          <p class="popup-genres"></p>
          <p class="popup-overview"></p>
          <p class="popup-actors"></p> <!-- Section des acteurs principaux -->
        </div>
      </div>`;
    document.body.appendChild(popup);
  }

  // Mettre à jour le contenu du popup avec les informations du film
  popup.querySelector('.popup-poster').src = `${imageBaseURL}${movie.poster_path}`;
  popup.querySelector('.popup-title').textContent = movie.title;
  popup.querySelector('.popup-overview').textContent = movie.overview;
  popup.querySelector('.date_popup').textContent = movie.release_date.substring(0, 4);
  popup.querySelector('.vote_averagepop').textContent = movie.vote_average.toFixed(1);
  popup.querySelector('.popup-genres').textContent = mapGenres(movie.genre_ids);

  // Mettre à jour les acteurs principaux
  const actors = movie.actors && movie.actors.length > 0 ? movie.actors.join(", "): "Unknown actors";
  popup.querySelector('.popup-actors').textContent = `CAST: ${actors}`;

  // Afficher le popup
  popup.style.display = 'flex';

  // Ajouter un événement pour fermer le popup
  popup.querySelector('.popup-close').onclick = () => {
    popup.style.display = 'none';
  };

  // Cacher le popup si on clique en dehors de son contenu
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });
};

const fetchMovieActors = async (movieId) => {
  const apiKey = API_KEY; 
  const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`);
  const data = await response.json();
  return data.cast.slice(0, 3).map(actor => actor.name);
};


// ===============================================================================

// Attends que le contenu soit chargé pour initialiser les Swipers
document.addEventListener("DOMContentLoaded", () => {
  displayMoviesInSwiper(fetchPopularMovies, '.results .swiper-container-result');
  displayMoviesInSwiper(fetchLatestMovies, '.Latest_releases .swiper-container-result');
  displayMoviesInSwiper(fetchComedyMovies, '.results_swiper .swiper-container-result');
});


document.querySelector('.container_main button').addEventListener('click', () => {
  const query = document.querySelector('.search_input').value.trim();
  if (query) {
    displaySearchResults(query);
  }
});




