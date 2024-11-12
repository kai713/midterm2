// TODO implement favourites
//getting page elements
const searchInput = document.getElementById('search-input');
const recipesContainer = document.getElementById('recipes-container');
const recipeSectionDetailsShow = document.querySelector('#recipe-details-show');
const closeModalBtn = document.querySelector('.close-btn');

const recipeTitle = document.getElementById('recipe-title');
const recipeImage = document.getElementById('recipe-image');
const recipeDetails1 = document.getElementById('recipe-details1');
const recipeDetails2 = document.getElementById('recipe-details2');
const recipeDetails3 = document.getElementById('recipe-details3');
const favsSection = document.querySelector('.favsSection');
const favsButton = document.querySelector('#save-favorite');
const favouritesNavBar = document.querySelector('#favourites');


const logo = document.querySelector('.logo');
const home = document.querySelector('#home');

//array for storing favorite recipes
const favsArr = [];

const apiKey = '7a31f7c14b8846c69c5a2faf401ee203';

//random Recipes Section
const threeRandomRecipes = document.querySelector('.recommended-recipes-cards');
const threeRandomRecipesInner = document.querySelector('.recommended-recipes-card');

//getting random recipes
async function fetchThreeRandomRecipes() {
    try {
        //fetching
        const response = await fetch(`https://api.spoonacular.com/recipes/random?number=3&apiKey=${apiKey}`);
        const data = await response.json();

        // show rondom
        showThreeRandomRecipes(data.recipes);
    } catch (error) {
        console.error('Error fetching three random recipes:', error);
    }
}

//showing recipe cards
function showThreeRandomRecipes(recipes) {
    threeRandomRecipes.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('three-recipe-card');
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
        `;
        recipeCard.addEventListener('click', () => showRecipeDetails(recipe.id)); // Обработчик для показа деталей рецепта

        threeRandomRecipes.appendChild(recipeCard);
    });
}

// fetching in start to show three random recipes
fetchThreeRandomRecipes();

// adding event listener to favourites in navbar (html)
favouritesNavBar.addEventListener('click', () => fetchFavs());

function addToFavs(id){
    if (!favsArr.includes(id)) {
        favsArr.push(id);
        console.log(`Film ID ${id} added to wishlist. Current wishlist:`, favsArr);
    } else {
        console.log(`Film ID ${id} is already in the wishlist.`);
    }
}

// fetching favs from site and enter in inner html
async function fetchFavs() {
    try {
        recipesContainer.innerHTML = '';
        recipesContainer.style.display = 'grid';
        recipeSectionDetailsShow.style.display = 'none';
        threeRandomRecipesInner.style.display = 'none';
        threeRandomRecipes.style.display = 'none';

        for (const id of favsArr) {
            const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
            const data = await response.json();

            // Создание карточки для каждого рецепта
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <img src="${data.image}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p>Ready in ${data.readyInMinutes} minutes</p>
            `;
            recipeCard.addEventListener('click', () => showRecipeDetails(id));

            recipesContainer.appendChild(recipeCard);
        }
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
    }
}

//addEventListener to react for each input
searchInput.addEventListener('input', () => {
    console.log('check: ' + searchInput.value);
    if (searchInput.value.length > 2) {
        fetchRecipes(searchInput.value);
    }
});

//fetch recipes and activate displayRecipes() function
async function fetchRecipes(query) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=12&apiKey=${apiKey}`);
        console.log('getting response: ' + response);
        const data = await response.json();
        console.log('getting data is:' + data.results);
        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

//display by inserting tags in recipesContainer
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipesContainer.style.display = 'grid';
    threeRandomRecipesInner.style.display= 'none';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="https://spoonacular.com/recipeImages/${recipe.id}-480x360.jpg" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes} minutes</p>
        `;
        recipeCard.dataset.id = recipe.id;
        recipeCard.addEventListener('click', () => showRecipeDetails(recipe.id));
        recipesContainer.appendChild(recipeCard);
    });
}

// when we click on recipeCard (recipeCard.addEventListener('click', () => showRecipeDetails(recipe.id));)
// div this function activate
async function showRecipeDetails(id) {
    favsButton.addEventListener('click', () => addToFavs(id));

    threeRandomRecipes.style.display = 'none';
    threeRandomRecipesInner.style.display = 'none';

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`);
        const data = await response.json();

        recipesContainer.style.display = 'none';
        recipesContainer.innerHTML = '';
        recipeSectionDetailsShow.style.display = 'block';

        recipeTitle.textContent = data.title;
        recipeImage.src = data.image;
        recipeDetails1.innerHTML = `
            <h3>Ingredients:</h3>
            <ul>${data.extendedIngredients.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join('')}</ul>
        `;
        recipeDetails2.innerHTML = `
            <h3>Instructions:</h3>
            <p>${data.instructions}</p>
        `;
        recipeDetails3.innerHTML = `
            <h3>Nutritional Information:</h3>
            <p>Calories: ${data.nutrition.nutrients.find(n => n.name === 'Calories').amount} kcal</p>
        `;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// just close and resetView
closeModalBtn.addEventListener('click', () => {
    resetView();
});
logo.addEventListener('click', () => resetView());
home.addEventListener('click', () => resetView());

// resetView to delete duplicating of code
function resetView() {
    favsSection.style.display = 'none';
    recipesContainer.style.display = 'none';
    recipeSectionDetailsShow.style.display = 'none';
    threeRandomRecipes.style.display = 'block';
    threeRandomRecipesInner.style.display = 'block'
}