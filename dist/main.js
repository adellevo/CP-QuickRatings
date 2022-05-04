// src/main.ts
var POPUP_PARENT_CONTAINER_CLASS = "polyratings-popup-container";
var addEvalSC = () => {
  const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]');
  sectionArr.forEach((section) => {
    var _a;
    let profArr = findProfessorName(section.innerText);
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
  let profArr = findProfessorName(section.innerText);
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
var initPopup = (prof) => {
  const tempararyDiv = document.createElement("div");
  const popupHtml = `
  <div class="polyratings-popup">
  <div>
  <h1>${prof.firstName} ${prof.lastName}</h1>
  <p>Based on ${prof.numEvals} ${prof.numEvals == 1 ? "rating" : "ratings"}..</p>
  </div>
  <div class="polyratings-popup-row">
      <div>
      Overall:
      </div>
      <div>
      ${prof.overallRating.toFixed(2)} / 4.00
      </div>
  </div>
  <div class="polyratings-popup-row">
      <div>
      Clarity:
      </div>
      <div>
      ${prof.materialClear.toFixed(2)} / 4.00
      </div>
  </div> 
  <div class="polyratings-popup-row">
      <div>
      Helpfulness:
      </div>
      <div>
      ${prof.studentDifficulties.toFixed(2)} / 4.00
      </div>
  </div>
  <div class="polyratings-popup-btn">
  <a
      href="https://Polyratings.dev/professor/${prof.id}"
      target="_blank"
  >
      View on Polyratings
  </a>
  </div>
</div>
`;
  tempararyDiv.innerHTML = popupHtml;
  return tempararyDiv.children[0];
};
var getProfLink = (prof) => `https://polyratings.dev/teacher/${prof.id}`;
var getProfInfo = async (profContainer, profArr, section, platform, bwSize) => {
  for (let [i, professorName] of profArr.entries()) {
    const [firstName, lastName] = professorName.split(/(?<=^\S+)\s/);
    const prof = await findProfessor(firstName, lastName);
    if (profArr.length == 1) {
      if (prof !== void 0) {
        if (platform == "SC" && profContainer.children.length === 1) {
          const popup = initPopup(prof);
          profContainer.appendChild(popup);
          profContainer.classList.add(POPUP_PARENT_CONTAINER_CLASS);
          section.style.cssText += "display:flex;max-width:fit-content;background-color: #D4E9B8;margin-top:10px";
        } else if (platform == "SB") {
          const link = getProfLink(prof);
          if (profContainer.children.length === 2 && bwSize === "small") {
            section.innerHTML = `<a href='${link}' target='_blank'> ${professorName} </a>`;
          } else if (profContainer.children.length === 1 && bwSize === "large") {
            section.innerHTML = `<span><a href='${link}' target='_blank'> ${professorName} </a><span>`;
          }
        }
      }
    } else {
      if (i == 0)
        section.innerText = "";
      let uniqueProf = document.createElement("span");
      if (platform == "SC") {
        if (section.children.length < profArr.length) {
          uniqueProf.innerHTML = `${professorName}<br>`;
          section.appendChild(uniqueProf);
          if (prof !== void 0) {
            uniqueProf.style.cssText += "background-color: #D4E9B8; margin-bottom: 4px;";
            const popup = initPopup(prof);
            profContainer.appendChild(popup);
          }
        }
      } else if (platform == "SB") {
        if (section.children.length < profArr.length * 2) {
          if (prof !== void 0) {
            const link = getProfLink(prof);
            uniqueProf.innerHTML = `<a href='${link}' target='_blank'>${professorName}</a>`;
          } else {
            uniqueProf.innerHTML = `${professorName}`;
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
var findProfessorName = (name) => {
  if (name === "To be Announced" || name === "Staff") {
    return null;
  }
  return name.split(",").map((item) => item.trim());
};
var findProfessor = async (firstName, lastName) => {
  const allProfessors = await getProfessorRatings();
  return allProfessors.find((prof) => prof.firstName === firstName && prof.lastName === lastName);
};
var profs = [];
var getProfessorRatings = async () => {
  if (profs.length) {
    return [...profs];
  }
  const githubRes = await fetch("https://api.github.com/repos/Polyratings/Polyratings-data/contents/professor-list.json?ref=data", {
    headers: {
      accept: "application/vnd.github.v3.raw"
    }
  });
  if (githubRes.status != 200) {
    console.log("error, status code " + githubRes.status);
    return [];
  }
  profs = await githubRes.json();
  return [...profs];
};
var main = async () => {
  while (true) {
    addEvalSC();
    addEvalSB();
    await new Promise((resolve) => setTimeout(resolve, 1e3));
  }
};
main();
