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
    getProfessorInfo("First Last");
    setTimeout(setup, 1000);
    // funcName("https://www.polyratings.com/list.html")
}

getProfessorInfo = (name) => {
    const id = getProfessorID(name);

    chrome.runtime.sendMessage(
        {
            url: 'https://www.polyratings.com/eval/' + id + '/index.html',
        },
        (response) => {
            if (response != "error") {
                // console.log(response);
                let temp = document.createElement('html');
                temp.innerHTML = response;
                
                let ratings = temp.getElementsByClassName("row eval-header")[0].innerText;
                console.log(ratings);
                
                const stars = ratings.substring(ratings.indexOf('evaluations')-12, ratings.indexOf('evaluations')-3);
                console.log('star rating: ' + stars);

                const rsd = ratings.substring(ratings.indexOf('Difficulties')+14, ratings.indexOf('Difficulties')+18);
                console.log('Recognizes Student Difficulty: ' + rsd);

                const pmc = ratings.substring(ratings.indexOf('Clearly')+9, ratings.indexOf('Clearly')+13);
                console.log('Presents Material Clearly: ' + pmc);
            }
        }
    );
}

// Query csv file to get professor id from name
// Names in csv file have no space - either get ride of space here or figure out 
// how to add spaces when creating
getProfessorID = (name) => {
    const id = 2073;
    return id;
}
setup();
