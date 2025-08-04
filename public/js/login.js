function loginSubmit(event) {
  event.preventDefault();

  const useremaillogin = event.target.useremaillogin.value.trim();
  const userpasswordlogin = event.target.userpasswordlogin.value.trim();

  const obj = {
    useremaillogin,
    userpasswordlogin
  };

  localStorage.setItem('expensesPerPage', 5);

  axios.post('https://spendwise-livepoint.onrender.com/api/logindetails', obj)
    .then((result) => {
      const message = result.data.message;

      if (message === 'Wrong password') {
        Toastify({
          text: "Wrong password",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)"
        }).showToast();
        return;
      }

      const token = result.data.token;

      localStorage.setItem('token', token);
      console.log(token)
       
      window.location.href = '/expense';    
  
    })
    .catch((error) => {
      const msg = error.response?.data?.message;

      if (msg === 'Wrong password') {
        Toastify({
          text: "Wrong password",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b"
        }).showToast();
      } else if (msg === 'User does not exist') {
        Toastify({
          text: "User does not exist",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b"
        }).showToast();
      } else {
        Toastify({
          text: "Something went wrong",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff0000"
        }).showToast();
        console.error(error);
      }
    });
}
