const apiKey = 'a6feafab881d9ca37bc7055e8d1e7349';

// BEGINNING 


window.onload = function () {
  const defaultType = document.querySelector('input[name="mediaType"]:checked').value;
  loadPopularContent(defaultType);
};

document.getElementById("searchInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    document.getElementById("searchBTN").click(); // triggers your search
  }
});

//.......................................................................................................

//  SEARCHING MOVIES OR TV SHOWS MANUALLY 
function searchMovie() {
  const query = document.getElementById('searchInput').value;
  const mediaType = document.querySelector('input[name="mediaType"]:checked').value;

  if (!query) {
    alert("Please enter a name to search.");
    return;
  }

  fetch(`https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      displayMovies(data.results, mediaType);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert("Something went wrong while fetching data.");
    });
}

//.......................................................................................................

//LOAD POPULAR OR TRENDING CONTENT IN THE HOME PAGE 
function loadPopularContent(type = 'movie', page = 1) {
  fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${apiKey}&page=${page}`)
    .then(response => response.json())
    .then(data => {
      displayMovies(data.results, type);
    })
    .catch(error => {
      console.error('Error loading popular content:', error);
    });
}

//.......................................................................................................

// DISPLAY MOVIES OR TV SHOWS 
function displayMovies(movies, mediaType = "movie") {
  const container = document.getElementById('movieContainer');
  container.innerHTML = ''; // Clear previous results

  if (movies.length === 0) {
    container.innerHTML = '<p>No results found. Try a different name.</p>';
    return;
  }

  const favourites = JSON.parse(localStorage.getItem('favourites')) || [];

  movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.className = 'movie';

    const title = movie.title || movie.name;
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    const isFavourite = favourites.includes(`${mediaType}-${movie.id}`);

    movieDiv.innerHTML = `
      <img src="${poster}" alt="${title}">
      <h3>${title}</h3>
      <p>⭐ Rating: ${movie.vote_average || 'N/A'}</p>
      <p>${movie.overview ? movie.overview.slice(0, 100) + '...' : 'No overview available.'}</p>
      <button class="trailer_button" onclick="showTrailer(${movie.id}, '${mediaType}')">Watch Trailer</button>
      <button class="fav_button" onclick="toggleFavourite('${mediaType}', ${movie.id}, this)">
        ${isFavourite ? '💔 Remove Favourite' : '❤️ Add to Favourites'}
      </button>
    `;

    container.appendChild(movieDiv);
  });
}

//.......................................................................................................

// SHOW TRAILER 
function showTrailer(id, type = 'movie') {
  fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");

      if (trailer) {
        const trailerModal = document.getElementById('trailerModal');
        trailerModal.style.display = 'block';
        trailerModal.innerHTML = `
          <div class="modal-content">
            <span id="closeModal" class="close">&times;</span>
            <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
          </div>
        `;

        document.getElementById('closeModal').onclick = () => {
          trailerModal.style.display = 'none';
        };
      } else {
        alert("Trailer not available.");
      }
    })
    .catch(err => {
      console.error("Error fetching trailer:", err);
      alert("Failed to load trailer.");
    });
}

// ADD TO FAVOURITES
function toggleFavourite(type, id, button) {
  let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
  const favId = `${type}-${id}`;

  if (favourites.includes(favId)) {
    favourites = favourites.filter(f => f !== favId);
    button.textContent = '❤️ Add to Favourites';
  } else {
    favourites.push(favId);
    button.textContent = '💔 Remove Favourite';
  }

  localStorage.setItem('favourites', JSON.stringify(favourites));
}

function showFavourites() {
  const favourites = JSON.parse(localStorage.getItem('favourites')) || [];

  if (favourites.length === 0) {
    alert("No favourites saved.");
    return;
  }

  const fetchPromises = favourites.map(fav => {
    const [type, id] = fav.split('-');
    return fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`)
      .then(res => res.json())
      .then(data => ({ ...data, media_type: type }));
  });

  Promise.all(fetchPromises)
    .then(results => {
      displayMovies(results);
    })
    .catch(error => {
      console.error("Error loading favourites:", error);
      alert("Something went wrong while loading favourites.");
    });
}

// HOME PAGE
document.getElementById('logo').addEventListener('click', () => {
  fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`)
    .then(response => response.json())
    .then(data => {
      displayMovies(data.results);
    })
    .catch(error => {
      console.error("Error loading home page movies:", error);
      alert("Failed to load popular movies.");
    });
}); 



// COOL TRANSITION
document.getElementById('logo').addEventListener('click', () => {
  movieContainer.classList.add('fade-out');

  setTimeout(() => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`)
      .then(res => res.json())
      .then(data => {
        displayMovies(data.results);
        movieContainer.classList.remove('fade-out'); // Fade back in
      });
  }, 500); // Matches transition duration
})



//..................................END........................................................