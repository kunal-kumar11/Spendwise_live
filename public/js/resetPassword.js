const pathParts = window.location.pathname.split('/');
const resetToken = pathParts[pathParts.length - 1];

function submitNewPassword(event) {
  event.preventDefault();
  const newPassword = document.getElementById('newPassword').value;

  axios.post('https://spendwise-livepoint.onrender.com/api/reset-password', {
    resetToken,
    newPassword
  })
  .then(response => {
    alert('Password has been reset successfully!');
    window.location.href = '/login';
  })
  .catch(error => {
    alert('Error: ' + error.response.data.error);
  });
}
