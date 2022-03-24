let profs = new Map();

addEvalSC = () => {
    const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]'); // array of sections
    sectionArr.forEach((section) => {
        let profArr = findProfs(section.innerText); // array of profs for that section
        if (profArr != null) {
            let profContainer = section.parentNode.parentNode;
            profContainer.classList.add("parContainer");
            getProfessorInfo(profContainer, profArr, section, "SC");
        }
    });
};

addEvalSB = () => {
    let iframe = document.getElementById("ptifrmtgtframe");
    if (iframe != undefined) {
        if (iframe.contentDocument != undefined) {
            // ---- start: for popup testing later ----
            // if (iframe.contentDocument.querySelector("#custom-css") === null) {
            //     console.log("yoooo uhhh i'm in here");
            //     let link = document.createElement("link");
            //     link.id = "custom-css";
            //     link.rel = "stylesheet";
            //     link.type = "text/css";
            //     link.href = "main.css";
            //     let iframeHead = iframe.contentDocument.getElementsByTagName("head")[0];
            //     iframeHead.appendChild(link);
            // }
            // ---- end: for popup testing later ----
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
                                let profArr = findProfs(section.innerText);
                                if (profArr != null) {
                                    let profContainer = section.parentNode;
                                    profContainer.classList.add("parContainer");
                                    getProfessorInfo(
                                        profContainer,
                                        profArr,
                                        section,
                                        "SB"
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

initPopup = (prof, section) => {
    // create popup
    let popup = document.createElement("div");
    popup.className = "hidden-popup";
    // popup.style.cssText =
    //     "visibility: hidden;position: absolute; width: 136px;height: 0;overflow: hidden;font-size: 11px;font-weight: 400;font-family: Arial, Helvetica, sans-serif;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;background-color: white;margin: 5px;padding: 6px;color: #494a4;text-align: center;vertical-align: middle;border-radius: 5px;";

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
    btn.innerHTML = `<a href='https://Polyratings.dev/teacher/${prof.id}' target='_blank'> View on Polyratings </a>`;
    btn.className = "btn";
    // btn.style.cssText =
    //     "background-color: #5b6448;padding: 5px;border-radius: 2px;border-style: none;text-decoration: none;margin-top: 10px;letter-spacing: 0.2px;";
    popup.appendChild(btn);

    // add event listener for popup
    eventHandler = () => popup.classList.toggle("visible-popup");
    section.addEventListener("click", eventHandler);
    section.style.cssText += "cursor:pointer;";

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

getProfessorInfo = async (profContainer, profArr, section, platform) => {
    for (let i = 0; i < profArr.length; i++) {
        const prof = profs.find(
            (prof) => prof.firstName + " " + prof.lastName === profArr[i]
        );

        // only one prof
        if (profArr.length == 1) {
            if (prof !== undefined) {
                if (platform == "SC" && profContainer.children.length === 1) {
                    const popup = initPopup(prof, section);
                    profContainer.appendChild(popup);
                    section.style.cssText += "background-color: #D4E9B8;";
                } else if (platform == "SB" && profContainer.children.length === 2) {
                    section.innerHTML = `<a href='https://Polyratings.dev/teacher/${prof.id}' target='_blank'> ${profArr[i]} </a>`;
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
                        const popup = initPopup(prof, section);
                        profContainer.appendChild(popup);
                    }
                }
            } else if (platform == "SB") {
                if (section.children.length < profArr.length * 2) {
                    if (prof !== undefined) {
                        uniqueProf.innerHTML = `<a href='https://Polyratings.dev/teacher/${prof.id}' target='_blank'> ${profArr[i]} </a>`;
                    } else {
                        uniqueProf.innerHTML = `${profArr[i]}`;
                    }
                    section.appendChild(uniqueProf);
                    if (section.children.length != profArr.length * 2 - 1) {
                        let comma = document.createElement("span");
                        comma.innerText = ",&nbsp";
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
