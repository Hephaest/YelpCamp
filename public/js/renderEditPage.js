/** *** Submit Listener *****/
const updateButton = document.querySelector('#edit-btn');
const editForm = document.querySelector('#edit-form');

updateButton.addEventListener('click', () => {
  updateButton.classList.add('disabled');
  updateButton.disabled = true;
  editForm.submit();
});
