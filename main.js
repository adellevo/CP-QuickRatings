let profs = new Map();
// sectionArr = array of sections
// profArr = array of profs for that section
addEvalSC = () => {
    const sectionArr = document.querySelectorAll('[id*="MTG_INSTR$"]');
    sectionArr.forEach((section) => {
        let profArr = findProfs(section.innerText);
        if (profArr != null) {
            let profContainer = section.parentNode;
            profContainer.className = "parContainer";

            // account for multiple profs
            let tempDiv = document.createElement("div");
            // let nCount = 0; // number of nonexistent profs
            for (let i = 0; i < profArr.length; i++) {
                let newElement = document.createElement("span");
                getProfessorInfo(profContainer, profArr, i, tempDiv, newElement, section);
            }
        }
    });
};

addEvalSB = () => {
    console.log("addEvalSB");
    // ------- schedule builder -------
    var iframe = document.getElementById("ptifrmtgtframe");
    if (iframe.contentDocument) {
        // let iframeBody = iframe.contentDocument.body;
        // // let iName = iframe.contentDocument.body.getElementsByClassName(
        // //     "cx-MuiTypography-root css-1xnpogb d-flex align-items-center pb-1 pr-1 cx-MuiTypography-body1"
        // // );
        let iframeBody = iframe.contentDocument.body;
        let sectionsList = iframeBody.querySelectorAll('[aria-label="Sections List"]')[0];
        if (sectionsList != undefined) {
            // let divList = sectionsList.getElementsByTagName("div");
            // if (divList != undefined) {
            //     console.log(divList);
            // }
            let sectionInfoContainer = sectionsList.getElementsByClassName(
                "cx-MuiGrid-root css-11nzenr  cx-MuiGrid-container cx-MuiGrid-item"
            );
            if (sectionInfoContainer != undefined) {
                for (i = 0; i < sectionInfoContainer.length; i++) {
                    let sectionInfo = sectionInfoContainer.item(i);
                    if (sectionInfo != undefined) {
                        let profNameElement = sectionInfo
                            .getElementsByTagName("dd")
                            .item(0);
                        console.log(profNameElement);
                    }
                }
            }

            // console.log(divList);
        }
        // console.log(sectionsList.getElementsByTagName("dd").innerText);
        // console.log(iframeBody.innerHTML);
    }
};

initPopup = (profContainer, prof) => {
    // create popup
    let popup = document.createElement("div");
    popup.style.display = "none";
    popup.className = "popup";

    // popup header
    const titleDiv = document.createElement("div");
    titleDiv.innerHTML = `<h1>${prof.firstName} ${prof.lastName}</h1><p>Based on ${prof.numEvals} ratings...</p>`;
    popup.appendChild(titleDiv);

    // create table rows
    const overview = [
        `Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${prof.overallRating} / 4.00`,
        `Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${prof.materialClear} / 4.00`,
        `Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;${prof.studentDifficulties} / 4.00`,
    ];
    overview.forEach((subrating, i) => {
        let subDiv = document.createElement("div");
        subDiv.innerHTML = subrating;
        popup.appendChild(subDiv);
        i % 2 == 0
            ? (subDiv.className = "subrating-even")
            : (subDiv.className = "subrating-odd");
    });

    // PolyRatings link
    const btn = document.createElement("div");
    btn.innerHTML = `<a href='https://polyratings.dev/teacher/${prof.id}' target='_blank'> View on PolyRatings </a>`;
    btn.className = "btn";
    popup.appendChild(btn);

    // add event listeners for popup
    handleMouseOver = () => (popup.style.display = "block");
    handleMouseOut = () => (popup.style.display = "none");
    profContainer.addEventListener("mouseover", handleMouseOver, { once: false });
    profContainer.addEventListener("mouseout", handleMouseOut, { once: false });

    return popup;
};

// returns array of professors
findProfs = (name) =>
    name == "To be Announced" || name == "Staff" ? null : name.split(",");

getProfessorInfo = async (profContainer, profArr, i, tempDiv, newElement, section) => {
    // console.log(profArr[i]);
    const prof = profs.find(
        (prof) => prof.firstName + " " + prof.lastName === profArr[i]
    );
    if (prof === undefined) {
        newElement.innerHTML = `${profArr[i]}<br>`;
        tempDiv.appendChild(newElement);
        profContainer.replaceChild(tempDiv, section);
        return;
    }
    const popup = initPopup(profContainer, prof);
    profContainer.appendChild(popup);

    const color = "#D4E9B8";
    newElement.setAttribute("style", `background-color: ${color}`);
    newElement.innerHTML = `${prof.firstName} ${prof.lastName}<br>`;

    // only one prof
    if (profArr.length == 1) {
        profContainer.replaceChild(newElement, section);
    }
    // multiple profs
    else {
        tempDiv.appendChild(newElement);
        profContainer.replaceChild(tempDiv, section);
    }
    // else {
    //     newElement.innerHTML = `${profArr[i]}<br>`;
    //     tempDiv.appendChild(newElement);
    //     profContainer.replaceChild(tempDiv, section);
    // }
};

getProfessorRatings = async () => {
    const init = {
        method: "GET",
        headers: {
            accept: "application/vnd.github.v3.raw",
        },
    };
    fetch(
        "https://api.github.com/repos/Polyratings/polyratings-data/contents/professor-list.json?ref=data",
        init
    )
        .then((response) => {
            if (response.status != 200) {
                console.log("error, status code " + response.status);
                return "error";
            }
            return response.json();
        })
        .then((response) => {
            profs = response;
        })
        .catch((err) => {
            console.log("Fetch error: " + err);
        });
};

setup = async () => {
    // only creates global map of prorfessor names/ids once
    if (profs.size === 0) {
        // console.log('getting professors');
        await getProfessorRatings();
    }
    addEvalSC(document);
    addEvalSB(document);
    setTimeout(setup, 1000);
};

setup();
