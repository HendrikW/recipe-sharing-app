document.addEventListener(
  'DOMContentLoaded',
  () => {
    console.log('IronGenerator JS imported successfully!');
  },
  false
);

function hideNavigationBar() {
  document.getElementsByClassName('navbar').style.display = 'none';
}

const recipes = []; // how to get the recipes from the db?

function checkCuisine(cuisine) {
  return (cuisine = document.getElementById('cuisine').value);
}

// function filterCuisine() {
//   console.log('filter cuisine function running ');
//   document.getElementById('filteredRecipes').innerHTML = recipes.filter(
//     checkCuisine
//   );
// }

// document
//   .getElementById('rezepte-form')
//   .addEventListener('keypress', function (event) {
//     console.log('event', event);
//     if (13 == event.keyCode) {
//       event.preventDefault();
//     }
//   });
