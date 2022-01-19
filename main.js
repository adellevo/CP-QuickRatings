// sectionArr = array of sections
// profArr = array of profs for that section
addEval = (document) => {
    const sectionArr = document.querySelectorAll('[id^="MTG_INSTR"]');
    sectionArr.forEach(((section) => {
        // page.querySelector(`[data-search=${CSS.escape(name)}`).getAttribute('href');
        let rating = "3.5"; // placeholder
        let profArr = findProfs(section.innerText); 
        if (profArr != null) {
            // two profs
            if (profArr.length == 2) {
                let newElement = document.createElement("span");
                newElement.innerHTML = `${profArr[0]} (${rating}), ${profArr[1]} (${rating})`;
                section.parentNode.replaceChild(newElement, section);
            }
            // only one prof
            else {
                let newElement = document.createElement("span");
                newElement.innerHTML = `${section.innerHTML} (${rating})`;
                section.parentNode.replaceChild(newElement, section);
            }
        }
    }));
}

// returns array of professors
findProfs = (name) => ((name == "To be Announced" || name == "Staff") ? null : name.split(','));

setup = () => {
    addEval(document);
    setTimeout(setup, 1000);
    // funcName("https://www.polyratings.com/list.html")
}
setup();
