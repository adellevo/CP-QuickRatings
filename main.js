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
            profContainer.className = 'parContainer';
            let popup = initPopup(profContainer, profArr[0]);
            profContainer.appendChild(popup); 
            profContainer.replaceChild(newElement, section);
        }
    }));
}

initPopup = (profContainer, profName) => {
    // create popup
    let popup = document.createElement('div');
    popup.style.display = 'none';
    popup.className = 'popup';

    const modalTip = document.createElement('div');
    modalTip.className = 'arrowUp';
    popup.appendChild(modalTip);

    const titleDiv = document.createElement('div');
    const evalNum = 37; // placeholder
    titleDiv.innerHTML = `<h1>${profName}</h1><p>Based on ${evalNum} ratings...</p>`;
    popup.appendChild(titleDiv);

    // fill popup with subrating data
    const overview = [
        "Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.4 / 4.0",
        "Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.4 / 4.0",
        "Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;3.4 / 4.0",
    ];
    overview.forEach((subrating, i) => {
        let subDiv = document.createElement('div');
        subDiv.innerHTML = subrating;
        popup.appendChild(subDiv);
        (i % 2 == 0) 
            ? subDiv.className = 'subrating-even' 
            : subDiv.className = 'subrating-odd';
    });

    // PolyRatings link
    const btn = document.createElement('div');
    btn.innerHTML = '<a href="https://www.polyratings.com/list.html" target="_blank"> View on PolyRatings </a>';
    btn.className = 'btn';
    popup.appendChild(btn);
    
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
