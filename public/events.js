
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
  for (let index in data.events) {
    $('.list').append(
      '<li><h3>' + data.events[index].title + '</h3></li>' +
      '<p> Start: ' + data.events[index].start + '</p>' +
      '<p> End: ' + data.events[index].end + '</p>' +
      '<p>' + data.events[index].details + '</p>' +
      '<input type="button" class="edit" data-id="' + data.events[index]._id + '" value="Edit">' +
      '<input type="button" class="delete" data-id="' + data.events[index]._id + '" value="Delete">'
    );
  }
}

function getAndDisplayEvents() {
  getEvents(displayEvents);
}


// function getOneEvent(callback) {
//   const apiCall = {
//     method: "GET",
//     url: "/api/event/:id",
//     data: "",
//     dataType: "json",
//     success: callback
//   };
//   $.ajax(apiCall);
// }
//
// function getAndDisplayOneEvent() {
//   getOneEvent(displayOneEvent);
// }

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
    if(event.target && event.target.className == 'create-event') {
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
    if(event.target && event.target.className == 'edit-event') {
      event.preventDefault();
      let formData = {
        "_id": $('.edit-event').data('id'),
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
    if(event.target && event.target.className == 'edit') {
      event.preventDefault();
      const url = "/events/edit/" + event.target.dataset.id;
      console.log(url);
      window.location=url;
    }
  });
  // DELETE EVENT
  document.addEventListener('click', function(event) {
    if(event.target && event.target.className == 'delete') {
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

//ON LOAD
$(function() {
  getAndDisplayEvents();
  listeners();
});
