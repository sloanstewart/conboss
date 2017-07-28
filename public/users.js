var MOCK_USERS = {
  "users": [
    {
      "id": "111",
      "email":"fake@email.net",
      "pass": "randomstring",
      "firstName": "User",
      "lastName": "One",
      "saved_events": [
        {"id": "222"},
        {"id": "333"}
      ]
    },
    {
      "id": "111",
      "email":"junk@mail.tk",
      "pass": "stuffandthings",
      "firstName": "Terrible",
      "lastName": "Two",
      "saved_events": [
        {"id": "333"},
        {"id": "111"}
      ]
    },
    {
      "id": "111",
      "email":"user3@conboss.org",
      "pass": "whatever",
      "firstName": "Dude",
      "lastName": "Three",
      "saved_events": [
        {"id": "111"},
      ]
    },
  ]
};

function getUsers(callback) {
  setTimeout(function() { callback(MOCK_USERS)}, 100);
}

function displayUsers(data) {
  for (index in data.users) {
    $('ul').append(
      '<li>' + data.users[index].lastName + ", " + data.users[index].firstName + '</li>' +
      '<p>' + data.users[index].email + '</p>'
    );
  }
}

function getAndDisplayUsers() {
  getUsers(displayUsers);
}

$(function() {
  getAndDisplayUsers();
});
