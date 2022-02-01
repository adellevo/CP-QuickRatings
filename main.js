let profs = new Map();
// sectionArr = array of sections
// profArr = array of profs for that section
addEval = () => {
    const sectionArr = document.querySelectorAll('[id*="MTG_INSTR$"]');
    sectionArr.forEach(((section) => {
        let profArr = findProfs(section.innerText); 
        if (profArr != null) {
            // let rating = 3.5;
            // let newElement = document.createElement("span");
            
            let profContainer = section.parentNode;
            profContainer.className = 'parContainer';

            let newElement = document.createElement("span");
            getProfessorInfo(profContainer, profArr, newElement, section);
        }
    }));
}

initPopup = (profContainer, prof) => {
    // create popup
    let popup = document.createElement('div');
    popup.style.display = 'none';
    popup.className = 'popup';

    // popup header 
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `<h1>${prof.name}</h1><p>Based on ${prof.nr} ratings...</p>`;
    popup.appendChild(titleDiv);

    // create table rows 
    const overview = [
        `Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${prof.stars} / 4.00`,
        `Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${prof.pmc} / 4.00`,
        `Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;${prof.rsd} / 4.00`,
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
    btn.innerHTML = `<a href=${prof.url} target="_blank"> View on PolyRatings </a>`;
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
    return rating >= 3 ? upper
        : rating >= 2 ? mid
        : bottom;
}

// returns array of professors
findProfs = (name) => ((name == "To be Announced" || name == "Staff") ? null : name.split(','));

setup = async ()  => {
    // only creates global map of prorfessor names/ids once
    if (profs.size === 0) {
        console.log('getting professor ids');
        await parseCsvResponse();
    }
    addEval(document);
    setTimeout(setup, 1000);
}

getProfessorInfo = async (profContainer, profArr, newElement, section) => {
    const id = await getProfessorID(profArr[0]);
    const url = 'https://www.polyratings.com/eval/' + id + '/index.html';
    chrome.runtime.sendMessage(
        {
            url: url
        },
        (response) => {
            if (response != "error") {
                let temp = document.createElement('html');
                temp.innerHTML = response;
                
                const stars = temp.getElementsByClassName("text-primary")[1].innerText.split("/")[0];
                // console.log('star rating: ' + stars);

                const numRatings = temp.querySelectorAll('b')[0].innerText.split(" ")[0];
                // console.log('number of ratings: ' + numRatings);
            
                const rsd = temp.querySelectorAll('b')[1].innerText.split(": ")[1];
                // console.log('Recognizes Student Difficulty: ' + rsd);

                const pmc = temp.querySelectorAll('b')[2].innerText.split(": ")[1];
                // console.log('Presents Material Clearly: ' + pmc);
                
                const prof = {
                    "name": profArr[0],
                    "stars": stars, // # of ratings
                    "rsd": rsd, // recognizes student difficulty
                    "pmc": pmc, // presents material clearly
                    "nr": numRatings, // # of evals
                    "url": url // PolyRatings url
                }

                let popup = initPopup(profContainer, prof);
                profContainer.appendChild(popup); 

                // two profs
                if (profArr.length == 2) {
                    newElement.innerText = `${profArr[0]} (${prof.stars}), ${profArr[1]} (${prof.stars})`;
                }
                // only one prof
                else {
                    newElement.innerText = `${prof.name} (${prof.stars})`;
                }
                color = setTierColor(parseFloat(prof.stars));
                newElement.setAttribute("style", `background-color: ${color}`);
                profContainer.replaceChild(newElement, section);
                // newElement.setAttribute('style', 'text-decoration: underline');

                // // Convert JSON object to string to store it
                // window.localStorage.setItem(name, JSON.stringify(prof));

                // arr = callback(ratings);
            }
        }
    );
}

// Turns CSV file data into large block of text
readCsvValues = () => {
    const url = chrome.runtime.getURL('./profIds.csv');
    return fetch(url)
        .then((response) => {
            return response.text().then(text => {
                // console.log(text);
                return text;
        }).catch((err) => {
            console.log(err);
        })
    });
}

// Turns CSV text into map with professor_name as key and professor_id as value
parseCsvResponse = async () => {
    let responseData = await readCsvValues();
    let lines = responseData.split('\n');

    // skip the header and last line which is empty
    lines.forEach((line, i) => {
        if (i == 0 || i == lines.length - 1) 
            return;
        current = line.split(',');
        const prof_name = current[0];
        const prof_id = current[1].replace('\r', '');
        profs.set(prof_name, prof_id);
    });

    console.log(profs);
    // return profs;
} 

// Use global map to get professor_id from professor_name
// Names in csv file have no space so removing space from names here 
getProfessorID = async (name) => {
    const space_removed = name.replace(/\s/g, '');
    // console.log(space_removed);
    const id = profs.get(space_removed);
    // console.log(id);
    return id;
}
setup();
