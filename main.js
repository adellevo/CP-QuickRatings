let profs = new Map();

/* ---- student center ---- */

addEvalSC = () => {
    const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]'); // array of sections
    sectionArr.forEach((section) => {
        let profArr = findProfs(section.innerText); // array of profs for that section
        if (profArr != null) {
            let profContainer = section.parentNode.parentNode;
            profContainer.classList.add("parContainer");
            getProfInfo(profContainer, profArr, section, "SC", "all");
        }
    });
};

/* ---- schedule builder ---- */

getSBProfs = (section, bwSize) => {
    let profArr = findProfs(section.innerText);
    if (profArr != null) {
        let profContainer = section.parentNode;
        profContainer.classList.add("parContainer");
        getProfInfo(profContainer, profArr, section, "SB", bwSize);
    }
};

// parse elements for smaller browser widths in SB
smallerBW = (sectionInfoContainer) => {
    if (sectionInfoContainer != undefined) {
        for (i = 0; i < sectionInfoContainer.length; i++) {
            let sectionInfo = sectionInfoContainer.item(i);
            if (sectionInfo != undefined) {
                let section = sectionInfo.getElementsByTagName("dd").item(0);
                getSBProfs(section, "small");
            }
        }
    }
};

// parse elements for larger browser widths in SB
largerBW = (sectionInfoContainer) => {
    console.log(sectionInfoContainer);
    if (sectionInfoContainer != undefined) {
        for (i = 0; i < sectionInfoContainer.length; i++) {
            let sectionInfo = sectionInfoContainer[i].getElementsByClassName(
                "cx-MuiTypography-root css-w00cnv cx-MuiTypography-body1"
            );
            let labels = sectionInfoContainer[i].getElementsByClassName(
                " cx-MuiTypography-root cx-MuiTypography-body1 cx-MuiTypography-colorTextSecondary"
            );
            if (labels != undefined && sectionInfo != undefined) {
                let labelArr = [];
                for (let i = 0; i < labels.length; i++) {
                    labelArr.push(labels[i].innerText);
                }
                const index = labelArr.findIndex((label) => label === "Instructor:");
                let section = sectionInfo.item(index);
                if (section != null) {
                    getSBProfs(section, "large");
                }
            }
        }
    }
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
                    sbwClasses =
                        "cx-MuiGrid-root css-11nzenr  cx-MuiGrid-container cx-MuiGrid-item";
                    lbwClasses =
                        "cx-MuiGrid-root cx-MuiGrid-container cx-MuiGrid-spacing-xs-1";
                    smallerBW(sectionsList.getElementsByClassName(sbwClasses));
                    largerBW(sectionsList.getElementsByClassName(lbwClasses));
                }
            }
        }
    }
};

/* ---- general ---- */

initPopup = (prof, section, parContainer) => {
    // create popup
    let popup = document.createElement("div");
    popup.className = "hidden-popup";

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
    const link = getProfLink(prof);
    btn.innerHTML = `<a href='${link}' target='_blank'> View on Polyratings </a>`;
    btn.className = "btn";
    popup.appendChild(btn);

    // handle popup actions
    popupOpen = () => {
        if (!popup.classList.contains("visible-popup")) {
            popup.classList.toggle("visible-popup");
            section.style.removeProperty("margin-top");
            section.style.cssText +=
                "align-items: center; flex-direction: column; margin-top:2px";
        }
    };
    popupClose = () => {
        if (popup.classList.contains("visible-popup")) {
            popup.classList.toggle("visible-popup");
            section.style.removeProperty("align-items");
            section.style.removeProperty("flex-direction");
            section.style.cssText += "margin-top:12px;";
        }
    };

    section.addEventListener("mouseenter", popupOpen);
    parContainer.addEventListener("mouseleave", popupClose);
    // section.style.cssText += "cursor:pointer;";

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

// returns link to professor's rating page
getProfLink = (prof) => `https://Polyratings.dev/teacher/${prof.id}`;

getProfInfo = async (profContainer, profArr, section, platform, bwSize) => {
    for (let i = 0; i < profArr.length; i++) {
        const prof = profs.find(
            (prof) => prof.firstName + " " + prof.lastName === profArr[i]
        );

        // only one prof
        if (profArr.length == 1) {
            if (prof !== undefined) {
                if (platform == "SC" && profContainer.children.length === 1) {
                    const popup = initPopup(prof, section, profContainer);
                    profContainer.appendChild(popup);
                    section.style.cssText +=
                        "display:flex;max-width:fit-content;background-color: #D4E9B8;margin-top:10px";
                } else if (platform == "SB") {
                    const link = getProfLink(prof);
                    if (profContainer.children.length === 2 && bwSize === "small") {
                        section.innerHTML = `<a href='${link}' target='_blank'> ${profArr[i]} </a>`;
                    } else if (
                        profContainer.children.length === 1 &&
                        bwSize === "large"
                    ) {
                        // console.log(section);
                        section.innerHTML = `<span><a href='${link}' target='_blank'> ${profArr[i]} </a><span>`;
                    }
                }
            }
        }

        // multiple profs
        else {
            if (i == 0) section.innerText = ""; // remove initial text with all profs combined together
            let uniqueProf = document.createElement("span"); // create span for individual profs

            if (platform == "SC") {
                if (section.children.length < profArr.length) {
                    uniqueProf.innerHTML = `${profArr[i]}<br>`;
                    section.appendChild(uniqueProf);

                    // append popup to container
                    if (prof !== undefined) {
                        uniqueProf.style.cssText +=
                            "background-color: #D4E9B8; margin-bottom: 4px;";
                        const popup = initPopup(prof, section, profContainer);
                        profContainer.appendChild(popup);
                    }
                }
            } else if (platform == "SB") {
                if (section.children.length < profArr.length * 2) {
                    if (prof !== undefined) {
                        const link = getProfLink(prof);
                        uniqueProf.innerHTML = `<a href='${link}' target='_blank'>${profArr[i]}</a>`;
                    } else {
                        uniqueProf.innerHTML = `${profArr[i]}`;
                    }
                    section.appendChild(uniqueProf);
                    if (section.children.length != profArr.length * 2 - 1) {
                        let comma = document.createElement("span");
                        comma.innerText = ",\u00A0";
                        section.appendChild(comma);
                    }
                }
            }
        }
    }
};

getProfessorRatings = async () => {
    const init = {
        method: "GET",
        headers: {
            accept: "application/vnd.github.v3.raw",
        },
    };
    fetch(
        "https://api.github.com/repos/Polyratings/Polyratings-data/contents/professor-list.json?ref=data",
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
