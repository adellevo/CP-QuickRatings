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
            if (profArr.length == 2) 
                newElement.innerHTML = `${profArr[0]} (${rating}), ${profArr[1]} (${rating})`;
            // only one prof
            else 
                newElement.innerHTML = `${section.innerHTML} (${rating})`;
            section.parentNode.replaceChild(newElement, section);
        }
    }));
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
    addEval(document);
    getProfessorInfo();
    setTimeout(setup, 1000);
    // funcName("https://www.polyratings.com/list.html")
}

getProfessorInfo = () => {
    chrome.runtime.sendMessage(
        {
            method: 'GET',
            url: 'https://www.polyratings.com/eval/2073/index.html',
        },
        (response) => {
            if (response != "error") {
                console.log(response);
            }
        }
    );
}
setup();
