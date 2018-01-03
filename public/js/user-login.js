const handleLogin = (e) => {
  e.preventDefault();
  const email = $('#email').val();
  const password = $('#password').val();
  $.ajax({
    type: "POST",
    url: "/users/login",
    dataType: "json", 
    success(user) {
      document.history.pushState({ user }, "Dashboard", `/dashboard/${user.id}`);
    },
    error(err) {
        console.log(err);
    },
    data: {
     email,
     password
    }
  });
}

$('#login').on('click', handleLogin);
