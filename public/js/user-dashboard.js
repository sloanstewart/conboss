// user.savedEvents.forEach((event) => {
//   let dateOptions = {
//     month: 'short',
//     day: '2-digit',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric'
//   };
//   let start = new Date(event.start).toLocaleString('en-US', dateOptions);
//   let end = new Date(event.end).toLocaleString('en-US', dateOptions);
//   return renderEvent(event);
// });

((user) => {
  console.log(user);
  //   if (user.savedEvents) {
  //     return user.savedEvents.forEach((event) => renderEvent(event));
  //   }
  //   return 'No events found.';
})();

const renderEvent = (event) =>
  `<div class="list-item card">
    <div class="dialog-content">
        <span class="text-title" href="../../events/view/<%= event._id %>"> ${
          event.title
        } </span>
        <p class="text-subhead"> ${event.start}  -  ${event.end}</p>
        <!-- <p class=""> event.details </p> -->
    </div>
    <div class="dialog-button-container">
        <a class="text-button" id="btn-details" data-id=${
          event._id
        } href="../../events/view/${event._id}">Details</a>
        <a class="text-button" id="btn-remove" data-id=${
          event._id
        } href="../../api/events/remove/${event._id}">Remove</a>
    </div>
</div>`;
