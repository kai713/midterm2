//getting DOM elements to use them later
const searchInput = document.getElementById('search-input');
const foundFilms = document.querySelector('.found-films');
const filmSection = document.querySelector('.film-section');
const apiKey = '84fff6094c18c7a23ab17b6d1c6ef708';
const logo = document.querySelector('.logo');
const home = document.querySelector('#home');
const filmInfoCloseBtn = document.querySelector('.film-info-close-btn');
const favouritesSection = document.querySelector('.favourites');

const recommendedContainer = document.querySelector('.recommended-films-container');
const recommendedSection = document.querySelector('.recommended-films');

const wishListButton = document.querySelector('.film-info-add-wish');
const wish = document.querySelector('#wish');

const threeRamd = document.querySelector('.recommended-recipes');

let arrOfWishList = [];

//to show recommended films when app is start
fetchRecommendedFilms();

//close wish list
favouritesSection.style.display = 'none';

// if click -> fetchFavorites()
wish.addEventListener('click', () => fetchFavorites());

//getting recommended films from 0 to 5
async function fetchRecommendedFilms() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        showRecommendedFilms(data.results.slice(0, 5));
    } catch (error) {
        console.error('Error fetching recommended films', error);
    }
}

//print recommended films
function showRecommendedFilms(recommended) {
    recommendedContainer.innerHTML = '';
    recommended.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('recommended-film-card');
        filmCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w700${film.poster_path}" alt="${film.title}">
            <h3>${film.title}</h3>
        `;
        filmCard.addEventListener('click', () => showFilmDetails(film.id));
        recommendedContainer.appendChild(filmCard);
    });
}

//react to user input if length of symbols greater than 2
searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 2) {
        fetchFilms(searchInput.value);
    }
});

//fetch films from api and activate func shoeFilms
async function fetchFilms(searchInput) {
    foundFilms.style.display = 'grid';
    favouritesSection.style.display = 'none';
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchInput}&api_key=${apiKey}`);
        const data = await response.json();
        showFilms(data.results);
    } catch (error) {
        console.error('Error fetching films', error);
    }
}

//show films by inserting tags in foundFilms and adding it in the end
function showFilms(results) {
    recommendedSection.style.display = 'none';
    foundFilms.innerHTML = '';


    results.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
        `;
        movieCard.addEventListener('click', () => showFilmDetails(movie.id));
        foundFilms.appendChild(movieCard);
    });
}

//show details of film when user have clicked to div of film (by movieCard.addEventListener('click', () => showFilmDetails(movie.id));)
async function showFilmDetails(id) {
    recommendedSection.style.display = 'none';
    foundFilms.style.display = 'none';

    const filmInfoImg = document.querySelector('.film-info-img');
    const filmInfoTitle = document.querySelector('.film-info-film-title');
    const filmInfoRating = document.querySelector('.film-info-film-rating');
    const filmInfoJanr = document.querySelector('.film-info-film-janr');
    const filmInfoTime = document.querySelector('.film-info-film-time');
    const filmInfoReleaseDate = document.querySelector('.film-info-film-release');
    const filmInfoMembers = document.querySelector('.film-info-film-actors');
    const filmInfoDesc = document.querySelector('.film-info-film-desc');
    const trailerContainer = document.querySelector('.trailer');

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`);
        const data = await response.json();
        const trailer = data.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');


        filmInfoTitle.textContent = data.title;
        filmInfoImg.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
        filmInfoImg.alt = data.title;
        filmInfoRating.innerHTML = `<p><strong>Rating:</strong> ${data.vote_average}/10</p>`;
        filmInfoJanr.innerHTML = `<p><strong>Genres:</strong> ${data.genres.map(genre => genre.name).join(', ')}</p>`;
        filmInfoTime.innerHTML = `<p><strong>Runtime:</strong> ${data.runtime} minutes</p>`;
        filmInfoReleaseDate.innerHTML = `<p><strong>Release Date:</strong> ${data.release_date}</p>`;
        filmInfoMembers.innerHTML = `<h4>Cast:</h4> 
            <ul>${data.credits.cast.slice(0, 5).map(member => `<li>${member.name} as ${member.character}</li>`).join('')}</ul>`;
        filmInfoDesc.innerHTML = `<h6>Description: </h6>${data.overview}`;

        if (trailer) {
            trailerContainer.innerHTML = `
                <h6>Trailer:</h6>
                <iframe width="1000" height="600" src="https://www.youtube.com/embed/${trailer.key}" 
                        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            `;
        } else {
            trailerContainer.innerHTML = `<p>No trailer available</p>`;
        }

        wishListButton.removeEventListener('click', addToWishList);
        wishListButton.addEventListener('click', () => addToWishList(id));

        filmSection.style.display = 'block';
    } catch (error) {
        console.error('Error fetching film details', error);
    }
}

//adding in array films
function addToWishList(filmId) {
    if (!arrOfWishList.includes(filmId)) {
        arrOfWishList.push(filmId);
        console.log(`Film ID ${filmId} added to wishlist. Current wishlist:`, arrOfWishList);
    } else {
        console.log(`Film ID ${filmId} is already in the wishlist.`);
    }
}

//fetching films from array arrOfWishList and fetch, in array we have ids and this func just fetch all of them
// and then insert it in favouritesSection
async function fetchFavorites() {
    if(arrOfWishList.length === 0){
        showFavourites(null);
        return;
    }

    try {
        console.log("Fetching films for IDs:", arrOfWishList);


        const requests = arrOfWishList.map(async (filmId) => {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${filmId}?api_key=${apiKey}`);
            const data = await response.json();
            console.log(`API Response for Film ID ${filmId}:`, data);
            return data;
        });

        const results = await Promise.all(requests);
        console.log("Fetched Films:", results);

        if (Array.isArray(results) && results.length > 0) {
            showFavourites(results);
        } else {
        }
    } catch (error) {
    }
}

// show favourites (show elements from arrOfWishList)
function showFavourites(favourites) {
    if(favourites === null || favourites === undefined) {
        console.log("WORK");
        filmSection.style.display = 'none';
        recommendedContainer.style.display = 'none';
        foundFilms.style.display = 'none';
        recommendedSection.style.display = 'none';
        foundFilms.innerHTML = '';


        favouritesSection.innerHTML = '<h4> There no in wish list </h4>';
        favouritesSection.style.display = 'grid';
        return;
    }

    if (!favourites || !Array.isArray(favourites)) {
        return;
    }

    favouritesSection.innerHTML = '';
    filmSection.style.display = 'none';
    foundFilms.innerHTML = '';
    foundFilms.style.display = 'none';
    recommendedSection.style.display = 'none';
    recommendedContainer.style.display = 'none';

    favourites.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('favourite-card');
        filmCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w400${film.poster_path}" alt="${film.title}">
            <h3>${film.title}</h3>
            <p>Release Date: ${film.release_date}</p>
        `;
        filmCard.addEventListener('click', () => showFilmDetails(film.id));
        favouritesSection.appendChild(filmCard);
    });

    favouritesSection.style.display = 'grid';
}

// just hide some elements and show basic menu
function resetView() {
    filmSection.style.display = 'none';

    foundFilms.style.display = 'grid';
    foundFilms.innerHTML = '';

    favouritesSection.style.display = 'grid';
    favouritesSection.innerHTML = '';

    recommendedSection.style.display = 'block';
    recommendedContainer.style.display = 'block';

}

//using resetView for navbar elements and closeBtn
filmInfoCloseBtn.addEventListener('click', resetView);
home.addEventListener('click', resetView);
logo.addEventListener('click', resetView);