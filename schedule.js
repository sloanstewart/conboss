var MOCK_EVENTS = {
  "events": [
    {
      "id": "111",
      "title": "The First Event!",
      "details": "details for the first event right here.",
      "start": "2017-08-01T18:00:00.000Z",
      "end": "2017-08-01T19:00:00.000Z",
      "created": "2017-07-28T12:00:00.000Z"
    },
    {
      "id": "222",
      "title": "Another Sweet event",
      "details": "details for the second event right here.",
      "start": "2017-08-01T20:00:00.000Z",
      "end": "2017-08-01T21:00:00.000Z",
      "created": "2017-07-28T12:05:00.000Z"
    },
    {
      "id": "333",
      "title": "The First Event!",
      "details": "details for the first event right here.",
      "start": "2017-09-01T15:00:00.000Z",
      "end": "2017-09-01T17:00:00.000Z",
      "created": "2017-07-28T01:00:00.000Z"
    },
  ]
};

function getEvents(callback) {
  setTimeout(function() { callback(MOCK_EVENTS)}, 100);
}

function displayEvents() {
  for (index in data.events) {
    $('ul').append(
      '<li>' + data.events[index].title + '</li>'
    );
  }
}

function getAndDisplayEvents() {
  getEvents(displayEvents);
}

$(function() {
  getAndDisplayEvents();
});
