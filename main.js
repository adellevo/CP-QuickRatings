let profs = new Map();

addEvalSC = () => {
    const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]'); // array of sections
    sectionArr.forEach((section) => {
        let profArr = findProfs(section.innerText); // array of profs for that section
        if (profArr != null) {
            let profContainer = section.parentNode.parentNode;
            profContainer.classList.add("parContainer");
            getProfessorInfoSC(profContainer, profArr, section);
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
                                let section = sectionInfo
                                    .getElementsByTagName("dd")
                                    .item(0);
                                // let dd = document.createElement("dd");
                                // let link = getLink(profNameElement.innerText);
                                // if (link !== undefined) {
                                //     dd.innerHTML = `<a href=${link} target='_blank'> ${profNameElement.innerText} </a>`;
                                //     profNameElement.parentNode.replaceChild(
                                //         dd,
                                //         profNameElement
                                //     );
                                //     console.log(dd);
                                // }
                                // getProfessorInfoSB(profNameElement);

                                let profArr = findProfs(section.innerText);
                                if (profArr != null) {
                                    let profContainer = section.parentNode;
                                    profContainer.classList.add("parContainer");

                                    // account for multiple profs
                                    let tempDiv = document.createElement("div");
                                    // let nCount = 0; // number of nonexistent profs
                                    for (let i = 0; i < profArr.length; i++) {
                                        let newElement = document.createElement("dd");
                                        // getProfessorInfoSB(profNameElement);
                                        getProfessorInfoSB(
                                            profContainer,
                                            profArr,
                                            i,
                                            tempDiv,
                                            newElement,
                                            section
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // }
};

initPopup = (prof, section) => {
    // create popup
    let popup = document.createElement("div");
    // popup.style.display = "none";
    popup.className = "hidden-popup";
    // popup.setAttribute("style", "height: 0");
    // popup.style.height = "0";
    // popup.classList.add(popuptext);

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

    // PolyRatings link
    const btn = document.createElement("div");
    btn.innerHTML = `<a href='https://polyratings.dev/teacher/${prof.id}' target='_blank'> View on PolyRatings </a>`;
    btn.className = "btn";
    popup.appendChild(btn);

    // add event listener for popup
    eventHandler = () => popup.classList.toggle("visible-popup");
    section.addEventListener("click", eventHandler);
    section.style.cssText += "cursor:pointer;";
    // console.log("cursor: ", window.getComputedStyle(section.cursor));
    // profContainer.addEventListener("mouseout", eventHandler);

    // handleMouseOut = () => (popup.style.display = "none");
    // profContainer.addEventListener("mouseover", handleMouseOver, { once: false });
    // profContainer.addEventListener("mouseout", handleMouseOut, { once: false });

    return popup;
};

// returns array of professors
findProfs = (name) => {
    if (name == "To be Announced" || name == "Staff") {
        return null;
    } else {
        return name.split(",").map((item) => item.trim());
    }
};

getProfessorInfoSC = async (profContainer, profArr, section) => {
    for (let i = 0; i < profArr.length; i++) {
        const prof = profs.find(
            (prof) => prof.firstName + " " + prof.lastName === profArr[i]
        );

        // only one prof
        if (profArr.length == 1) {
            if (profContainer.children.length === 1) {
                if (prof !== undefined) {
                    const popup = initPopup(prof, section);
                    profContainer.appendChild(popup);
                    section.style.cssText += "background-color: #D4E9B8;";
                }
            }
        }

        // multiple profs
        else {
            if (section.children.length < profArr.length) {
                /* remove initial span with all profs combined together */
                if (i == 0) {
                    section.innerText = "";
                }

                /* create individual spans for each prof */
                let newSpan = document.createElement("span");
                newSpan.innerHTML = `${profArr[i]}<br>`;
                section.appendChild(newSpan);

                /* append popups to container */
                if (prof !== undefined) {
                    newSpan.style.cssText +=
                        "background-color: #D4E9B8; margin-bottom: 4px;";
                    const popup = initPopup(prof, section);
                    profContainer.appendChild(popup);
                }
            }
        }
    }
};

getProfessorInfoSB = async (profContainer, profArr, i, tempDiv, newElement, section) => {
    // console.log(profArr[i]);
    const prof = profs.find(
        (prof) => prof.firstName + " " + prof.lastName === profArr[i]
    );
    // console.log(prof);
    if (prof === undefined) {
        return;
    }
    // console.log("parent length: ", profContainer.children.length);

    // only one prof
    if (profArr.length == 1) {
        if (profContainer.children.length === 2) {
            const popup = initPopup(prof, section);
            profContainer.appendChild(popup);
            section.style.cssText += "background-color: #D4E9B8;";
            // profContainer.replaceChild(newElement, section);
        }
    }
    // multiple profs
    else {
        console.log("length not 1: ", profArr.length);
        tempDiv.appendChild(newElement);
        // profContainer.replaceChild(tempDiv, section);
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
