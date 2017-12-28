const handleLogin = (e) => {
  e.preventDefault();
  const email = $('#email').val();
  const password = $('#password').val();
  $.ajax({
    type: "POST",
    url: "/users/login",
    dataType: "json", 
    error: function (err) {
        console.log(err);
    },
    data: {
     email,
     password
    }
  });
}

$('#login').on('click', handleLogin);
