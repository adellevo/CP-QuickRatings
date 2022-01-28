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

    // const modalTip = document.createElement('div');
    // modalTip.className = 'arrowUp';
    // popup.appendChild(modalTip);

    // get data from PR, set values accordingly
    getProfessorInfo(profName);

    // 
    const jsonProf = JSON.parse(window.localStorage.getItem(profName));
    if (jsonProf != null) {

        // popup header 
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = `<h1>${jsonProf.name}</h1><p>Based on ${jsonProf.nr} ratings...</p>`;
        popup.appendChild(titleDiv);

        // create table rows 
        const overview = [
            `Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${jsonProf.stars} / 4.00`,
            `Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${jsonProf.pmc} / 4.00`,
            `Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;${jsonProf.rsd} / 4.00`,
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
        btn.innerHTML = `<a href=${jsonProf.url} target="_blank"> View on PolyRatings </a>`;
        btn.className = 'btn';
        popup.appendChild(btn);
        
        // add event listeners for popup
        handleMouseOver = () => popup.style.display = "block";
        handleMouseOut = () => popup.style.display = "none";
        profContainer.addEventListener('mouseover', handleMouseOver, {once: false});
        profContainer.addEventListener('mouseout', handleMouseOut, {once: false});
    }

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
    addEval(document);
    // getProfessorInfo("Phillip Nico");
    setTimeout(setup, 1000);
    // funcName("https://www.polyratings.com/list.html")
}

getProfessorInfo = async (name) => {
    const id = await getProfessorID(name);
    const url = 'https://www.polyratings.com/eval/' + id + '/index.html'; // Added this to link in popup later
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
                    "name": name,
                    "stars": stars, // # of ratings
                    "rsd": rsd, // recognizes student difficulty
                    "pmc": pmc, // presents material clearly
                    "nr": numRatings, // # of evals
                    "url": url // PolyRatings url
                }
                // Convert JSON object to string to store it
                window.localStorage.setItem(name, JSON.stringify(prof));

                // arr = callback(ratings);
                // console.log(arr);
            }
        }
    );
    // console.log(arr)
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
    const profs = new Map();

    lines.forEach((line, i) => {
        if (i == 0 || i == lines.length - 1) // skip the header and last line which is empty
            return;
        current = line.split(',');
        const prof_name = current[0];
        const prof_id = current[1].replace('\r', '');
        // console.log(current);
        profs.set(prof_name, prof_id);
    });

    console.log(profs);
    return profs;
    // console.log(responseData);
} 

// Use map to get professor_id from profess_name
// Names in csv file have no space so removing space from names here 
getProfessorID = async (name) => {
    const data = await parseCsvResponse();
    // console.log(data);
    const space_removed = name.replace(/\s/g, '');
    // console.log(space_removed);
    const id = data.get(space_removed);
    console.log(id);
    return id;
}
setup();
