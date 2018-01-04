const handleLogin = (e) => {
  e.preventDefault();
  const email = $('#email').val();
  const password = $('#password').val();
  $.ajax({
    type: "POST",
    url: "/users/login",
    dataType: "json", 
    // success(user) {
    //   window.redirect({ user }, "Dashboard", `user/dashboard/${user.id}`);
    // },
    error(err) {
        return err;
    },
    data: {
     email,
     password
    }
  });
}

$('#login').on('click', handleLogin);
