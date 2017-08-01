// var MOCK_EVENTS = {
//   "events": [
//     {
//       "id": "111",
//       "title": "The First Event!",
//       "details": "details for the first event right here.",
//       "start": "2017-08-01T18:00:00.000Z",
//       "end": "2017-08-01T19:00:00.000Z",
//       "created": "2017-07-28T12:00:00.000Z"
//     },
//     {
//       "id": "222",
//       "title": "Another Sweet event",
//       "details": "details for the second event right here.",
//       "start": "2017-08-01T20:00:00.000Z",
//       "end": "2017-08-01T21:00:00.000Z",
//       "created": "2017-07-28T12:05:00.000Z"
//     },
//     {
//       "id": "333",
//       "title": "The First Event!",
//       "details": "details for the first event right here.",
//       "start": "2017-09-01T15:00:00.000Z",
//       "end": "2017-09-01T17:00:00.000Z",
//       "created": "2017-07-28T01:00:00.000Z"
//     },
//   ]
// };
//
// function getEvents(callback) {
//   setTimeout(function() { callback(MOCK_EVENTS) }, 100);
// }

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

function listeners() {
  document.addEventListener('click', function(event) {
    if(event.target && event.target.className == 'edit') {
      event.preventDefault();
      const url = "/api/events/" + event.target.dataset.id;
      console.log(url);
      window.location=url;
    }
  });
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

$(function() {
  getAndDisplayEvents();
  listeners();
});
