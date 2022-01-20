// sectionArr = array of sections
// profArr = array of profs for that section
addEval = (document) => {
    const sectionArr = document.querySelectorAll('[id^="MTG_INSTR"]');
    sectionArr.forEach(((section) => {
        // page.querySelector(`[data-search=${CSS.escape(name)}`).getAttribute('href');
        let rating = "3.5"; // placeholder
        let profArr = findProfs(section.innerText); 
        if (profArr != null) {
            let newElement = document.createElement("span");
            color = setTierColor(parseFloat(rating));
            newElement.setAttribute("style", `background-color: ${color}`);
            // two profs
            if (profArr.length == 2) {
                newElement.innerHTML = `${profArr[0]} (${rating}), ${profArr[1]} (${rating})`;
            }
            // only one prof
            else {
                newElement.innerHTML = `${section.innerHTML} (${rating})`;
            }
            section.parentNode.replaceChild(newElement, section);
            section.addEventListener('mouseover', () => {
                alert("button clicked");
            });
        }
    }));
}

// function myAlert(){
//     alert('hello world');
// }

// document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('alertButton').addEventListener('click', myAlert);
// });

// let test = document.querySelector('[id^="MTG_INSTR"]');

// changeColor = (element) => {
//     console.log("helloooo in popup rn");
//     element.style.color = "purple";
// }

// popupListener = (element) => {
//     console.log("helloooo in popup rn");
//     // This handler will be executed only once when the cursor
//     // moves over the unordered list
//     element.addEventListener("mouseover", function( event ) {
//         // console.log("hello");
//         // highlight the mouseenter target
//         event.target.style.color = "purple";
//     }, false);
// }

// sets color based on rating tier
setTierColor = (rating) => {
    let upper = "#D4E9B8"; // green
    let mid = "#F4D48B"; // yellow-orange
    let bottom = "#F8B0B0"; // red
    return rating >= 3.5 ? upper
        : rating >= 2.5 ? mid
        : bottom;
}

// returns array of professors
findProfs = (name) => ((name == "To be Announced" || name == "Staff") ? null : name.split(','));

setup = () => {
    addEval(document);
    setTimeout(setup, 2000);
    // funcName("https://www.polyratings.com/list.html")
}
console.log("start");
setup();
