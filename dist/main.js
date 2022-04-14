// src/main.ts
var profs = [];
var addEvalSC = () => {
  console.log("Hello World");
  const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]');
  sectionArr.forEach((section) => {
    var _a;
    let profArr = findProfs(section.innerText);
    if (profArr) {
      if (section.parentNode) {
        let profContainer = (_a = section.parentElement) == null ? void 0 : _a.parentElement;
        if (profContainer) {
          profContainer.classList.add("parContainer");
          getProfInfo(profContainer, profArr, section, "SC", "all");
        }
      }
    }
  });
};
var getSBProfs = (section, bwSize) => {
  let profArr = findProfs(section.innerText);
  if (profArr) {
    let profContainer = section.parentElement;
    if (profContainer) {
      profContainer.classList.add("parContainer");
      getProfInfo(profContainer, profArr, section, "SB", bwSize);
    }
  }
};
var smallerBW = (sectionInfoContainer) => {
  if (sectionInfoContainer) {
    for (let i = 0; i < sectionInfoContainer.length; i++) {
      let sectionInfo = sectionInfoContainer.item(i);
      if (sectionInfo != void 0) {
        let section = sectionInfo.getElementsByTagName("dd").item(0);
        if (section) {
          getSBProfs(section, "small");
        }
      }
    }
  }
};
var largerBW = (sectionInfoContainer) => {
  if (sectionInfoContainer != void 0) {
    for (let i = 0; i < sectionInfoContainer.length; i++) {
      let sectionInfo = sectionInfoContainer[i].getElementsByClassName("cx-MuiTypography-root css-w00cnv cx-MuiTypography-body1");
      let labels = sectionInfoContainer[i].getElementsByClassName(" cx-MuiTypography-root cx-MuiTypography-body1 cx-MuiTypography-colorTextSecondary");
      if (labels != void 0 && sectionInfo != void 0) {
        let labelArr = [];
        for (let i2 = 0; i2 < labels.length; i2++) {
          labelArr.push(labels[i2].innerText);
        }
        const index = labelArr.findIndex((label) => label === "Instructor:");
        let section = sectionInfo.item(index);
        if (section) {
          getSBProfs(section, "large");
        }
      }
    }
  }
};
var addEvalSB = () => {
  let iframe = document.getElementById("ptifrmtgtframe");
  if (iframe) {
    if (iframe.contentDocument != void 0) {
      let iframeBody = iframe.contentDocument.body;
      if (iframeBody != void 0) {
        let sectionsList = iframeBody.querySelectorAll('[aria-label="Sections List"]')[0];
        if (sectionsList != void 0) {
          const sbwClasses = "cx-MuiGrid-root css-11nzenr  cx-MuiGrid-container cx-MuiGrid-item";
          const lbwClasses = "cx-MuiGrid-root cx-MuiGrid-container cx-MuiGrid-spacing-xs-1";
          smallerBW(sectionsList.getElementsByClassName(sbwClasses));
          largerBW(sectionsList.getElementsByClassName(lbwClasses));
        }
      }
    }
  }
};
var initPopup = (prof, section, parContainer) => {
  let popup = document.createElement("div");
  popup.className = "hidden-popup";
  const titleDiv = document.createElement("div");
  prof.numEvals == 1 ? titleDiv.innerHTML = `<h1>${prof.firstName} ${prof.lastName}</h1><p>Based on ${prof.numEvals} rating...</p>` : titleDiv.innerHTML = `<h1>${prof.firstName} ${prof.lastName}</h1><p>Based on ${prof.numEvals} ratings...</p>`;
  popup.appendChild(titleDiv);
  let displayOR = (Math.round(prof.overallRating * 100) / 100).toFixed(2);
  let displayMC = (Math.round(prof.materialClear * 100) / 100).toFixed(2);
  let displaySD = (Math.round(prof.studentDifficulties * 100) / 100).toFixed(2);
  const overview = [
    `Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${displayOR} / 4.00`,
    `Clarity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${displayMC} / 4.00`,
    `Helpfulness:&nbsp;&nbsp;&nbsp;&nbsp;${displaySD} / 4.00`
  ];
  overview.forEach((subrating, i) => {
    let subDiv = document.createElement("div");
    subDiv.innerHTML = subrating;
    popup.appendChild(subDiv);
    i % 2 == 0 ? subDiv.className = "subrating-even" : subDiv.className = "subrating-odd";
  });
  const btn = document.createElement("div");
  const link = getProfLink(prof);
  btn.innerHTML = `<a href='${link}' target='_blank'> View on Polyratings </a>`;
  btn.className = "btn";
  popup.appendChild(btn);
  const popupOpen = () => {
    if (!popup.classList.contains("visible-popup")) {
      popup.classList.toggle("visible-popup");
      section.style.removeProperty("margin-top");
      section.style.cssText += "align-items: center; flex-direction: column; margin-top:2px";
    }
  };
  const popupClose = () => {
    if (popup.classList.contains("visible-popup")) {
      popup.classList.toggle("visible-popup");
      section.style.removeProperty("align-items");
      section.style.removeProperty("flex-direction");
      section.style.cssText += "margin-top:12px;";
    }
  };
  section.addEventListener("mouseenter", popupOpen);
  parContainer.addEventListener("mouseleave", popupClose);
  return popup;
};
var findProfs = (name) => {
  if (name === "To be Announced" || name === "Staff") {
    return null;
  }
  return name.split(",").map((item) => item.trim());
};
var getProfLink = (prof) => `https://polyratings.dev/teacher/${prof.id}`;
var getProfInfo = async (profContainer, profArr, section, platform, bwSize) => {
  for (let i = 0; i < profArr.length; i++) {
    const prof = profs.find((prof2) => prof2.firstName + " " + prof2.lastName === profArr[i]);
    if (profArr.length == 1) {
      if (prof !== void 0) {
        if (platform == "SC" && profContainer.children.length === 1) {
          const popup = initPopup(prof, section, profContainer);
          profContainer.appendChild(popup);
          section.style.cssText += "display:flex;max-width:fit-content;background-color: #D4E9B8;margin-top:10px";
        } else if (platform == "SB") {
          const link = getProfLink(prof);
          if (profContainer.children.length === 2 && bwSize === "small") {
            section.innerHTML = `<a href='${link}' target='_blank'> ${profArr[i]} </a>`;
          } else if (profContainer.children.length === 1 && bwSize === "large") {
            section.innerHTML = `<span><a href='${link}' target='_blank'> ${profArr[i]} </a><span>`;
          }
        }
      }
    } else {
      if (i == 0)
        section.innerText = "";
      let uniqueProf = document.createElement("span");
      if (platform == "SC") {
        if (section.children.length < profArr.length) {
          uniqueProf.innerHTML = `${profArr[i]}<br>`;
          section.appendChild(uniqueProf);
          if (prof !== void 0) {
            uniqueProf.style.cssText += "background-color: #D4E9B8; margin-bottom: 4px;";
            const popup = initPopup(prof, section, profContainer);
            profContainer.appendChild(popup);
          }
        }
      } else if (platform == "SB") {
        if (section.children.length < profArr.length * 2) {
          if (prof !== void 0) {
            const link = getProfLink(prof);
            uniqueProf.innerHTML = `<a href='${link}' target='_blank'>${profArr[i]}</a>`;
          } else {
            uniqueProf.innerHTML = `${profArr[i]}`;
          }
          section.appendChild(uniqueProf);
          if (section.children.length != profArr.length * 2 - 1) {
            let comma = document.createElement("span");
            comma.innerText = ",\xA0";
            section.appendChild(comma);
          }
        }
      }
    }
  }
};
var getProfessorRatings = async () => {
  const init = {
    method: "GET",
    headers: {
      accept: "application/vnd.github.v3.raw"
    }
  };
  fetch("https://api.github.com/repos/Polyratings/Polyratings-data/contents/professor-list.json?ref=data", init).then((response) => {
    if (response.status != 200) {
      console.log("error, status code " + response.status);
      return "error";
    }
    return response.json();
  }).then((response) => {
    profs = response;
    console.log(profs);
  }).catch((err) => {
    console.log("Fetch error: " + err);
  });
};
var setup = async () => {
  if (profs.length === 0) {
    await getProfessorRatings();
  }
  addEvalSC();
  addEvalSB();
  setTimeout(setup, 1e3);
};
setup();
