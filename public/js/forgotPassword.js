function solveforgotPassword(event) {
  event.preventDefault();

  // Get the email value from the form
  const to = event.target.emailId.value;

  // Create the request object
  const obj = {
      to
  };

  // Show loading indicator and disable the form to prevent multiple submissions
  document.getElementById("loadingIndicator").style.display = "block";
  
  event.target.emailId.disabled = true;

  // Send the request to the backend (forgot password endpoint)
  axios.post('http://localhost:3111/api/forgotpassword', obj)
      .then((result) => {
          console.log("Success:", result.data);
          alert("Password reset email has been sent! Please check your inbox.");
          event.target.reset(); // Clear the form
      })
      .catch((error) => {
          console.error("Error:", error);
          alert("There was an error sending the password reset email. Please try again later.");
      });

  // Hide loading indicator and re-enable the form after request is complete
  document.getElementById("loadingIndicator").style.display = "none";
  event.target.emailId.disabled = false;
}
