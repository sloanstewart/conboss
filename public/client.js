

// E V E N TS ============================

// Get and display all Events
function getEvents(callback) {
  const apiCall = {
    method: "GET",
    url: "/api/events",
    data: "",
    dataType: "json",
    success: callback
  };
  $.ajax(apiCall);
}

function displayEvents(data) {
  const timeOptions = {};
  for (let index in data.events) {
    let start = new Date(data.events[index].start).toLocaleString();
    let end = new Date(data.events[index].end).toLocaleString();
    $('.event-list').append(
      '<div class="list-item">' +
        '<h2 class="item-title">' + data.events[index].title + '</h2>' +
        '<p><span class="item-time">' + start + ' - ' + end + '</span></p>' +
        '<p class="item-details">' + data.events[index].details + '</p>' +
        '<p>' +
          '<button id="btn-save" class="btn-green" data-id="' + data.events[index]._id + '">Save</button>' +
          '<button id="btn-edit" class="btn-yellow" data-id="' + data.events[index]._id + '">Edit</button>' +
          '<button id="btn-delete" class="btn-red" data-id="' + data.events[index]._id + '">Delete</button>' +
        '</p>' +
      '</div>'
    );
  }
}

function getAndDisplayEvents() {
  getEvents(displayEvents);
}

// Redirect after creating New Event
function createEventRedirect() {
  window.location.replace("./");
  return false;
}
function editEventRedirect() {
  window.location.replace("http://localhost:8080/events");
  return false;
}

// BUTTONS
function listeners() {
  // NEW EVENT
  document.addEventListener('click', function(event) {
    if(event.target && event.target.id == 'create-event') {
      event.preventDefault();
      const formData = {
        "title": $('#title').val(),
        "details": $('#details').val(),
        "start": $('#start').val(),
        "end": $('#end').val()
      };
      $.ajax({
        method: "POST",
        url: "/api/events",
        data: formData,
        success: function() {
          console.log('New event created');
          window.location.replace("/events");
        },
        error: function(err) {
          console.error(err);
        }
      });
    }
  });

  document.addEventListener('click', function(event) {
    if(event.target && event.target.id == 'edit-event') {
      event.preventDefault();
      let formData = {
        "_id": $('#edit-event').data('id'),
        "title": $('#title').val(),
        "start": $('#start').val(),
        "end": $('#end').val(),
        "details": $('#details').val()
      };
      $.ajax({
        method: "PUT",
        url: "/api/events/"+ formData._id,
        data: formData,
        success: function() {
          console.log('Event edited');
          window.location.replace("/events");
        },
        error: function(err) {
          console.error(err);
        }
      });
    }
  });
  // EDIT EVENT
  document.addEventListener('click', function(event) {
    if(event.target && event.target.id == 'btn-edit') {
      event.preventDefault();
      const url = "/events/edit/" + event.target.dataset.id;
      console.log(url);
      window.location=url;
    }
  });
  // DELETE EVENT
  document.addEventListener('click', function(event) {
    if(event.target && event.target.id == 'btn-delete') {
      event.preventDefault();
      const url = "/api/events/" + event.target.dataset.id;
      console.log(url);
      $.ajax({
        method: "DELETE",
        url: url,
        success: location.reload()
      });
    }
  });
}

// U S E R S ====================
date = new Date().toLocaleDateString();
var MOCK_USERS = {
  "users": [
    {
      "_id": "42346asdgad8647ad",
      "email": "ayylmao@memes.net",
      "username": "jwhat",
      "name": {
        "firstName": "Jethro",
        "lastName": "Whatevs"
      },
      "location": "Atlanta, GA",
      "bio": "just a bruh, doin' big thangs tbh",
      "created": date,
      "role": "admin",
      "saved_events": []
    },
    {
      "_id": "4657afsdhj6asdgad8647ad",
      "email": "ahack@gmail.com",
      "username": "ahack26",
      "name": {
        "firstName": "Amy",
        "lastName": "Hackler"
      },
      "location": "Nashville, TN",
      "bio": "lovin' this web majic!",
      "created": date,
      "role": "user",
      "saved_events": []
    },
    {
      "_id": "gfjkased5fja4r4a7",
      "email": "c.code@earthlink.net",
      "username": "cc97",
      "name": {
        "firstName": "Carrie",
        "lastName": "Code"
      },
      "location": "THE INTERNET",
      "bio": "I've spent more than 10hrs in my editor today.",
      "created": date,
      "role": "user",
      "saved_events": []
    },
  ]
};

function getUsers(callback) {
  setTimeout(function() { callback(MOCK_USERS)}, 100);
}

function displayUsers(data) {
  for (index in data.users) {
    let user = data.users[index];
    $('.user-list').append(
      '<div class="list-item">' +
        '<h2 class="item-title">' + user.username + '</h2>' +
        '<p><span class="item-time">' + user.name.firstName + ' ' + user.name.lastName + ' | <a href=mailto:"' + user.email + '">' + user.email + '</a></span></p>' +
        '<p class="item-details">' + user.bio + '</p>' +
        '<p>' +

          '<button id="btn-edit" class="btn-yellow" data-id="' + user._id + '">Edit</button>' +
          '<button id="btn-delete" class="btn-red" data-id="' + user._id + '">Delete</button>' +
        '</p>' +
      '</div>'
    );
  }
}

function getAndDisplayUsers() {
  getUsers(displayUsers);
}

$(function() {
  getAndDisplayUsers();
});


//ON LOAD
$(function() {
  getAndDisplayEvents();
  getAndDisplayUsers();
  listeners();
});
