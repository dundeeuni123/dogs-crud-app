const dogForm = document.getElementById('dogForm');
const dogList = document.getElementById('dogList');

async function loadDogs() {
  const res = await fetch('/api/dogs');
  const dogs = await res.json();
  dogList.innerHTML = '';

  dogs.forEach(dog => {
    const li = document.createElement('li');
    li.textContent = `${dog.breed}${dog.sub_breed ? ' - ' + dog.sub_breed : ''}`;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = async () => {
      await fetch(`/api/dogs/${dog.id}`, { method: 'DELETE' });
      loadDogs();
    };

    li.appendChild(del);
    dogList.appendChild(li);
  });
}

dogForm.onsubmit = async (e) => {
  e.preventDefault();
  const breed = document.getElementById('breed').value.trim();
  const sub_breed = document.getElementById('sub_breed').value.trim();

  if (!breed) return;

  await fetch('/api/dogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ breed, sub_breed })
  });

  dogForm.reset();
  loadDogs();
};

loadDogs();
