const dogForm = document.getElementById('dogForm');
const dogList = document.getElementById('dogList');

async function loadDogs() {
  const res = await fetch('/api/dogs');
  const dogs = await res.json();
  dogList.innerHTML = '';

  dogs.forEach(dog => {
    const li = document.createElement('li');

    // Text container
    const textSpan = document.createElement('span');
    textSpan.textContent = `${dog.breed}${dog.sub_breed ? ' - ' + dog.sub_breed : ''}`;
    li.appendChild(textSpan);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    li.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    li.appendChild(delBtn);

    // Delete functionality
    delBtn.onclick = async () => {
      await fetch(`/api/dogs/${dog.id}`, { method: 'DELETE' });
      loadDogs();
    };

    // Edit functionality
    editBtn.onclick = () => {
      // Replace text with inputs
      const breedInput = document.createElement('input');
      breedInput.type = 'text';
      breedInput.value = dog.breed;

      const subBreedInput = document.createElement('input');
      subBreedInput.type = 'text';
      subBreedInput.value = dog.sub_breed || '';

      li.innerHTML = ''; // Clear current content
      li.appendChild(breedInput);
      li.appendChild(subBreedInput);

      // Save button
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      li.appendChild(saveBtn);

      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      li.appendChild(cancelBtn);

      saveBtn.onclick = async () => {
        const updatedBreed = breedInput.value.trim();
        const updatedSubBreed = subBreedInput.value.trim();

        if (!updatedBreed) {
          alert('Breed is required.');
          return;
        }

        await fetch(`/api/dogs/${dog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ breed: updatedBreed, sub_breed: updatedSubBreed || null }),
        });

        loadDogs();
      };

      cancelBtn.onclick = () => {
        loadDogs();
      };
    };

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
