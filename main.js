let profs = new Map();
// sectionArr = array of sections
// profArr = array of profs for that section
addEval = () => {
    const sectionArr = document.querySelectorAll('[id*="MTG_INSTR$"]');
    sectionArr.forEach(((section) => {
        let profArr = findProfs(section.innerText); 
        if (profArr != null) {
            let profContainer = section.parentNode;
            profContainer.className = 'parContainer';
            
            // account for multiple profs
            let tempDiv = document.createElement('div'); 
            // let nCount = 0; // number of nonexistent profs
            for (let i = 0; i < profArr.length; i++) {
                let newElement = document.createElement('span');
                getProfessorInfo(profContainer, profArr, i, tempDiv, newElement, section);
            }
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
    btn.innerHTML = `<a href=${prof.url} target='_blank'> View on PolyRatings </a>`;
    btn.className = 'btn';
    popup.appendChild(btn);
    
    // add event listeners for popup
    handleMouseOver = () => popup.style.display = 'block';
    handleMouseOut = () => popup.style.display = 'none';
    profContainer.addEventListener('mouseover', handleMouseOver, {once: false});
    profContainer.addEventListener('mouseout', handleMouseOut, {once: false});

    return popup;
}

// returns array of professors
findProfs = (name) => ((name == 'To be Announced' || name == 'Staff') ? null : name.split(','));

setup = async ()  => {
    // only creates global map of prorfessor names/ids once
    if (profs.size === 0) {
        console.log('getting professors');
        await getProfessorRatings();
    }
    addEval(document);
    setTimeout(setup, 1000);
}

getProfessorInfo = async (profContainer, profArr, i, tempDiv, newElement, section) => {
    console.log(profArr[i]);
    chrome.runtime.sendMessage(
        {
            name: profArr[i]
        },
        (response) => {
            if (response == undefined || Object.keys(response).length == 0) {
                return;
            }
            else if (response != 'error') {
                const prof = {
                    'name': profArr[i], // prof name
                    'stars': response.overallRating, // # of ratings
                    'rsd': response.studentDifficulties, // recognizes student difficulty
                    'pmc': response.materialClear, // presents material clearly
                    'nr': response.numEvals, // # of evals
                    'url': 'https://polyratings.dev/teacher/' + response.id // PolyRatings url
                }

                const popup = initPopup(profContainer, prof);
                profContainer.appendChild(popup); 
                
                const color = '#D4E9B8';
                newElement.setAttribute('style', `background-color: ${color}`);
                newElement.innerHTML = `${prof.name}<br>`;
                
                // only one prof
                if (profArr.length == 1) {
                    profContainer.replaceChild(newElement, section);
                }
                // multiple profs
                else {
                    tempDiv.appendChild(newElement);
                    profContainer.replaceChild(tempDiv, section);
                }
            }
            else {
                newElement.innerHTML = `${profArr[i]}<br>`;
                tempDiv.appendChild(newElement);
                profContainer.replaceChild(tempDiv, section);
            }
        }
    );
    // return true;
    // return Promise.resolve("Dummy response to keep the console quiet");
}

getProfessorRatings = async () => {
    const init = {
        method: 'GET',
        headers: {
            'accept': 'application/vnd.github.v3.raw',
        }
    };
    fetch("https://api.github.com/repos/Polyratings/polyratings-data/contents/professor-list.json?ref=data", init)
        .then(response => {
            if (response.status != 200) {
                console.log('error, status code ' + response.status);
                return 'error';
            }
            return response.json();
        })
        .then((response) => {
            response.forEach((professor) => {
                console.log(professor);
                const prof_name = professor.firstName + ' ' + professor.lastName;
                
            })
        })
        .catch((err) => {
            console.log('Fetch error: ' + err);
        });

    // skip the header and last line which is empty
    // lines.forEach((line, i) => {
    //     if (i == 0 || i == lines.length - 1) 
    //         return;
    //     current = line.split(',');
    //     const prof_name = current[0];
    //     const prof_id = current[1].replace('\r', '');
    //     profs.set(prof_name, prof_id);
    // });

    // console.log(profs);
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
