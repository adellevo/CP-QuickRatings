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
    let iframe = document.getElementById("ptifrmtgtframe");
    if (iframe != undefined) {
        if (iframe.contentDocument != undefined) {
            let iframeBody = iframe.contentDocument.body;
            if (iframeBody != undefined) {
                let sectionsList = iframeBody.querySelectorAll(
                    '[aria-label="Sections List"]'
                )[0];
                if (sectionsList != undefined) {
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
                                // let dd = document.createElement("dd");
                                // dd.setAttribute(
                                //     "style",
                                //     `background-color: #D4E9B8; text-decoration: none; margin-left: -1px`
                                // );
                                // let link = getLink(profNameElement.innerText);
                                // if (link !== undefined) {
                                //     dd.innerHTML = `<a href=${link} target='_blank'> ${profNameElement.innerText} </a>`;
                                //     profNameElement.parentNode.replaceChild(
                                //         dd,
                                //         profNameElement
                                //     );

                                let tempDiv = document.createElement("div");
                                let newElement = document.createElement("dd");
                                getProfessorInfo2(
                                    profNameElement.parentNode,
                                    profNameElement.innerText,
                                    tempDiv,
                                    newElement,
                                    profNameElement,
                                    sectionInfo
                                );
                            }
                        }
                    }
                }
            }
        }
    }
    // }
};

initPopup = (profContainer, prof) => {
    // create popup
    let popup = document.createElement("div");
    popup.style.display = "none";
    popup.className = "popup";

    // popup header
    const titleDiv = document.createElement("div");
    prof.numEvals == 1
        ? (titleDiv.innerHTML = `<h1>${prof.firstName} ${prof.lastName}</h1><p>Based on ${prof.numEvals} rating...</p>`)
        : (titleDiv.innerHTML = `<h1>${prof.firstName} ${prof.lastName}</h1><p>Based on ${prof.numEvals} ratings...</p>`);
    popup.appendChild(titleDiv);

    // make ratings have consistent formatting
    let displayOR = prof.overallRating.toString();
    let displayMC = prof.materialClear.toString();
    let displaySD = prof.studentDifficulties.toString();
    orPadLen = 4 - displayOR.length;
    if (orPadLen !== 0) {
        orPadLen === 3 ? (displayOR += ".00") : (displayOR += "0" * orPadLen);
    }
    mcPadLen = 4 - displayMC.length;
    if (mcPadLen !== 0) {
        mcPadLen === 3 ? (displayMC += ".00") : (displayMC += "0" * mcPadLen);
    }
    sdPadLen = 4 - displaySD.length;
    if (sdPadLen !== 0) {
        sdPadLen === 3 ? (displaySD += ".00") : (displaySD += "0" * sdPadLen);
    }

    // create table rows
    const overview = [
        `Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${displayOR} / 4.00`,
        `Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${displayMC} / 4.00`,
        `Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;${displaySD} / 4.00`,
    ];
    overview.forEach((subrating, i) => {
        let subDiv = document.createElement("div");
        subDiv.innerHTML = subrating;
        popup.appendChild(subDiv);
        i % 2 == 0
            ? (subDiv.className = "subrating-even")
            : (subDiv.className = "subrating-odd");
    });

    // Polyratings link
    const btn = document.createElement("div");
    btn.innerHTML = `<a href='https://polyratings.dev/teacher/${prof.id}' target='_blank'> View on Polyratings </a>`;
    btn.className = "btn";
    popup.appendChild(btn);

    // add event listeners for popup
    handleMouseOver = () => (popup.style.display = "block");
    handleMouseOut = () => (popup.style.display = "none");
    profContainer.addEventListener("mouseover", handleMouseOver, { once: false });
    profContainer.addEventListener("mouseout", handleMouseOut, { once: false });

    return popup;
};

getProf = (sbProf) => {
    return profs.find((prof) => prof.firstName + " " + prof.lastName === sbProf);
};

getLink = (sbProf) => {
    const prof = profs.find((prof) => prof.firstName + " " + prof.lastName === sbProf);
    if (prof != undefined) {
        return `https://polyratings.dev/teacher/${prof.id}`;
    } else {
        return undefined;
    }
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

getProfessorInfo2 = async (
    ogParent,
    profName,
    tempDiv,
    ddElement,
    ogChild,
    sectionInfo
) => {
    const prof = profs.find((prof) => prof.firstName + " " + prof.lastName === profName);
    console.log("proffff: ", prof);
    if (prof === undefined) {
        // ddElement.innerHTML = `${profName}<br>`;
        // tempDiv.appendChild(ddElement);
        // ogParent.replaceChild(tempDiv, ogChild);
        return;
    }
    const color = "#D4E9B8";
    ogChild.setAttribute("style", `background-color: ${color}`);
    // ogChild.innerText = `${prof.firstName} ${prof.lastName}`;
    const popup = initPopup(ogChild, prof);
    // popup.className = "popup";
    if (ogChild.children.length === 0) {
        ogChild.appendChild(popup);
    }

    // const color = "#D4E9B8";
    // newElement.setAttribute("style", `background-color: ${color}`);
    // newElement.innerHTML = `${prof.firstName} ${prof.lastName}<br>`;
    // profContainer.replaceChild(newElement, section);
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
