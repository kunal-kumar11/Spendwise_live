function solve(event) {
    event.preventDefault();
  
    const username = event.target.username.value.trim();
    const useremail = event.target.useremail.value.trim();
    const userpassword = event.target.userpassword.value.trim();
  
    const obj = {
      username,
      useremail,
      userpassword
    };
  
    axios.post('https://spendwise-live-2.onrender.com/api/signupdetails', obj)
      .then((result) => {
        Toastify({
          text: "User signed up successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
        }).showToast();
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.data && error.response.data.error === 'Email already registered.') {
          Toastify({
            text: "This email already exists",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)"
          }).showToast();
        } else {
          Toastify({
            text: "Something went wrong",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#f00"
          }).showToast();
        }
      });
  }
  
