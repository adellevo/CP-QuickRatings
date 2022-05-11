// src/popup.ts
var POPUP_PARENT_CONTAINER_CLASS = "polyratings-popup-container";
var initPopup = (prof) => {
  const tempDiv = document.createElement("div");
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
  tempDiv.innerHTML = popupHtml;
  return tempDiv.children[0];
};

// src/professors.ts
var findProfessor = async (name) => {
  const allProfessors = await getProfessorRatings();
  return allProfessors.find((prof) => prof.firstName + " " + prof.lastName === name);
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

// src/scheduleBuilder.ts
var scheduleBuilder = () => {
  const SmallTargets = document.querySelectorAll(".cx-MuiGrid-root.css-11nzenr.cx-MuiGrid-container.cx-MuiGrid-item dl:first-child > dd");
  const LargeUnexpandedTargets = document.querySelectorAll(".cx-MuiButtonBase-root.cx-MuiExpansionPanelSummary-root > div:first-child > div:first-child > .cx-MuiGrid-container > div > div:first-child");
  const LargeExpandedTargets = document.querySelectorAll(".cx-MuiCollapse-container .cx-MuiGrid-root:nth-child(2) > div > div:nth-child(3) > p");
  if (SmallTargets) {
    handleSmallTargets([...Array.from(SmallTargets)]);
  }
  if (LargeUnexpandedTargets) {
    handleLargeUnexpandedTargets([...Array.from(LargeUnexpandedTargets)]);
  }
  if (LargeExpandedTargets) {
    handleLargeExpandedTargets([...Array.from(LargeExpandedTargets)]);
  }
};
var handleSmallTargets = (targets) => {
  targets.forEach(async (section) => {
    var _a;
    const professorList = [
      ...new Set(((_a = section.textContent) != null ? _a : "").split(",").map((element) => element.trim()))
    ];
    const validProfessors = professorList.map(async (professorName) => await findProfessor(professorName != null ? professorName : "") != void 0);
    const sectionChildren = [...Array.from(section.children)];
    const popupsCreated = sectionChildren.filter((child) => child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)).length;
    if (popupsCreated >= validProfessors.length) {
      return;
    }
    professorList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName != null ? professorName : "");
      if (section.children.length <= professorList.length) {
        let uniqueProfessorSpan = document.createElement("span");
        uniqueProfessorSpan.innerHTML = `${professorName}<br>`;
        section.appendChild(uniqueProfessorSpan);
        if (professor) {
          const popup = initPopup(professor);
          uniqueProfessorSpan.appendChild(popup);
          uniqueProfessorSpan.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        }
      }
    });
    section.innerHTML = section.innerHTML.substring(0, section.innerHTML.indexOf("<"));
  });
};
var handleLargeUnexpandedTargets = (targets) => {
  targets.forEach(async (section) => {
    var _a;
    const professorList = ((_a = section.textContent) != null ? _a : "").split(",").map((element) => element.trim());
    professorList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName != null ? professorName : "");
      if (professor) {
        section.style.cssText += "background-color: #D4E9B8";
        return;
      }
    });
  });
};
var handleLargeExpandedTargets = (targets) => {
  targets.forEach(async (section) => {
    var _a;
    const professorList = ((_a = section.textContent) != null ? _a : "").split(",").map((element) => element.trim());
    const sectionChildren = [...Array.from(section.children)];
    professorList.forEach(async (professorName) => {
      let targetChild;
      for (let i = 0; i < sectionChildren.length; i++) {
        if (sectionChildren[i].innerText == professorName) {
          targetChild = sectionChildren[i];
          break;
        }
      }
      if (targetChild && !targetChild.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
        const professor = await findProfessor(professorName != null ? professorName : "");
        if (professor) {
          const popup = initPopup(professor);
          targetChild.appendChild(popup);
          targetChild.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        }
      }
    });
  });
};

// src/studentCenter.ts
function studentCenter() {
  const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]');
  sectionArr.forEach(async (section) => {
    var _a;
    const professorList = [
      ...new Set(((_a = section.textContent) != null ? _a : "").split(",").map((element) => element.trim()))
    ];
    if (professorList.length == 1) {
      oneProfessor(section);
    } else {
      multipleProfessors(section, professorList);
    }
  });
}
var oneProfessor = async (section) => {
  var _a;
  const professor = await findProfessor((_a = section.textContent) != null ? _a : "");
  const profContainer = section.parentNode.parentNode;
  if (!professor || profContainer.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
    return;
  }
  const popup = initPopup(professor);
  profContainer.appendChild(popup);
  profContainer.classList.add(POPUP_PARENT_CONTAINER_CLASS);
};
var multipleProfessors = async (section, professorList) => {
  const validProfessors = professorList.map(async (professorName) => await findProfessor(professorName != null ? professorName : "") != void 0);
  if (section.innerText == "") {
    const sectionChildren = [...Array.from(section.children)];
    const popupsCreated = sectionChildren.filter((child) => child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)).length;
    if (popupsCreated == validProfessors.length) {
      return;
    }
  }
  professorList.forEach(async (professorName) => {
    const professor = await findProfessor(professorName != null ? professorName : "");
    if (section.children.length <= professorList.length) {
      let uniqueProfessorSpan = document.createElement("span");
      uniqueProfessorSpan.innerHTML = `${professorName}<br>`;
      section.appendChild(uniqueProfessorSpan);
      if (professor) {
        const popup = initPopup(professor);
        uniqueProfessorSpan.appendChild(popup);
        uniqueProfessorSpan.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      }
    }
  });
  section.innerText = "";
};

// src/main.ts
var main = async () => {
  while (true) {
    studentCenter();
    scheduleBuilder();
    await new Promise((resolve) => setTimeout(resolve, 1e3));
  }
};
main();
