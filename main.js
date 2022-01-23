// sectionArr = array of sections
// profArr = array of profs for that section
addEval = () => {
    const sectionArr = document.querySelectorAll('[id*="MTG_INSTR$"]');
    sectionArr.forEach(((section) => {
        // page.querySelector(`[data-search=${CSS.escape(name)}`).getAttribute('href');
        let rating = "3.5"; // placeholder
        let profArr = findProfs(section.innerText); 
        
        if (profArr != null) {
            let newElement = document.createElement("span");
            // two profs
            if (profArr.length == 2) {
                newElement.innerText = `${profArr[0]} (${rating}), ${profArr[1]} (${rating})`;
            }
            // only one prof
            else {
                newElement.innerText = `${profArr[0]} (${rating})`;
            }
            color = setTierColor(parseFloat(rating));
            newElement.setAttribute("style", `background-color: ${color}`);

            let profContainer = section.parentNode;
            let popup = initPopup(profContainer);
            profContainer.appendChild(popup); 
            profContainer.replaceChild(newElement, section);
        }
    }));
}

initPopup = (profContainer) => {
    // create popup
    let popup = document.createElement("div");
    popup.setAttribute("style", "background-color: lightblue");
    popup.style.display = "none"; 

    // fill popup with subrating data
    const overview = [
        "Clarity: 3.4",
        "Helpfulness: 3.3",
    ];
    overview.forEach((subrating) => {
        popup.appendChild(document.createTextNode(subrating));
        popup.appendChild(document.createElement("br"));
    });

    // PolyRatings link
    const anchor = document.createElement('a');
    anchor.innerHTML = '<a href="https://www.polyratings.com/list.html" target="_blank"> View on PolyRatings </a>';
    popup.appendChild(anchor);
    
    // add event listeners for popup
    handleMouseOver = () => popup.style.display = "block";
    handleMouseOut = () => popup.style.display = "none";
    profContainer.addEventListener('mouseover', handleMouseOver, {once: false});
    profContainer.addEventListener('mouseout', handleMouseOut, {once: false});

    return popup;
}

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
    addEval();
    setTimeout(setup, 1000);
    // funcName("https://www.polyratings.com/list.html")
}
console.log("start");
setup();
