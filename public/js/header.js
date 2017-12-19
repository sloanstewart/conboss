// NAVIGATION DRAWER ============================
/* Set the width of the side navigation to 256px */
function openNav() {
    document.getElementById("nav-drawer").style.width = "256px";
    document.getElementById("menu-icon").style.display = "none";
    document.getElementById("nav-drawer-overlay").style.display = "block";
    setTimeout(
      function() {
        document.getElementById("menu-icon").style.display = "block";
        document.getElementById("nav-drawer-overlay").style.opacity = "1";   
      }
    , 10);
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("nav-drawer").style.width = "0";
    document.getElementById("nav-drawer-overlay").style.opacity = "0";  
    setTimeout(
      function() {
        document.getElementById("menu-icon").style.display = "block";
        document.getElementById("nav-drawer-overlay").style.display = "none";
      }
    , 150);
  }
  