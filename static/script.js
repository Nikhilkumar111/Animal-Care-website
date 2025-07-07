const searchInput = document.getElementById("dogSearchInput");
const dogList = document.getElementById("dogList");
let allDogs = [];

function fetchLocalDogs() {
  try {
    allDogs = window.data; // use global variable
    renderDogs(allDogs);
  } catch (err) {
    dogList.innerHTML = "<p>Failed to load local data.</p>";
    console.error(err);
  }
}


function renderDogs(dogs) {
  dogList.innerHTML = dogs.map(dog => {
    const imageUrl = dog.image || 'https://via.placeholder.com/250';
    return `
      <div class="dog-card">
        <img src="${imageUrl}" alt="${dog.title}" />
        <h3>${dog.title}</h3>
        <p>${dog.description}</p>
        <p><strong>City:</strong> ${dog.city}</p>
        <p><strong>Contact:</strong> ${dog.contact.phone}</p>
      </div>
    `;
  }).join('');
}

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = allDogs.filter(d => 
    d.title.toLowerCase().includes(value) || 
    d.city.toLowerCase().includes(value) ||
    d.state.toLowerCase().includes(value)
  );
  renderDogs(filtered);
});

fetchLocalDogs();
