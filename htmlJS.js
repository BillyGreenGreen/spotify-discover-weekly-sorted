/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function showDropdown() {
    const drop = document.querySelectorAll("#dropdown");

    for (const dropL of drop){
        dropL.classList.add("show");
    }
  }

  function hideDropdown() {
    const drop = document.querySelectorAll("#dropdown");

    for (const dropL of drop){
        dropL.classList.remove("show");
    }
  }


function spotifySearch(){

var xmlhttp = new XMLHttpRequest();
var params = "songPartial="+document.getElementById("input").value;
console.log(document.getElementById("input").value);
    if (document.getElementById("input").value){
        showDropdown();
        xmlhttp.open("get", "/search?"+params, true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(null);
        xmlhttp.onreadystatechange = function(){
            if (this.readyState != 4) return;

                if (this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    console.log(data);

                    //dynamic dropdown list for searching
                    var dropdownContent = document.getElementById("dropdown");
                    while (dropdownContent.firstChild){
                        dropdownContent.removeChild(dropdownContent.lastChild);
                    }
                    for (var i = 0; i < Object.keys(data).length; i++){
                        console.log(i);
                        const mainContentDiv = document.createElement("div");
                        mainContentDiv.className = 'dropdown-main-content';
                        mainContentDiv.id = 'div' + i;
                        const image = document.createElement("img");
                        const songName = document.createElement("h1");
                        const artistName = document.createElement("h1");
                        image.src = data[i]['art'][2]['url'];
                        image.className = 'img-dropdown';
                        songName.innerText = data[i]['name'];
                        songName.className = 'song-dropdown';
                        artistName.innerText = data[i]['artist'][0]['name'];
                        artistName.className = 'artist-dropdown';
                        
                        dropdownContent.appendChild(mainContentDiv);
                        mainContentDiv.appendChild(image);
                        mainContentDiv.appendChild(songName);
                        mainContentDiv.appendChild(artistName);
                    }
                }
            }
    }
    else{
        hideDropdown();
    }
}
