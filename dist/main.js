// src/popup.ts
var POPUP_PARENT_CONTAINER_CLASS = "polyratings-popup-container";
var POPUP_CLASS = "polyratings-popup";
var initPopup = (prof) => {
  const tempDiv = document.createElement("div");
  const popupHtml = `
  <div class="${POPUP_CLASS}">
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
  targets.forEach(async (target) => {
    var _a;
    target.style.overflow = "visible";
    const professorNameList = [
      ...new Set(((_a = target.textContent) != null ? _a : "").split(",").map((element) => element.trim()))
    ];
    const sectionChildren = [...Array.from(target.children)];
    const isPopupCreated = sectionChildren.find((child) => child.classList.contains(POPUP_PARENT_CONTAINER_CLASS));
    if (isPopupCreated) {
      return;
    }
    const newHtml = await Promise.all(professorNameList.map(async (professorName) => {
      const professor = await findProfessor(professorName);
      if (!professor) {
        return `<span>${professorName}</span>`;
      }
      const popup = initPopup(professor);
      return `<span class="${POPUP_PARENT_CONTAINER_CLASS}">
          ${professorName}
        <div class="${POPUP_CLASS}">${popup.innerHTML}</div></span>`;
    }));
    target.innerHTML = newHtml.join("");
  });
};
var handleLargeUnexpandedTargets = (targets) => {
  targets.forEach(async (target) => {
    var _a;
    if (target.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
      return;
    }
    const professorNameList = ((_a = target.textContent) != null ? _a : "").split(",").map((element) => element.trim());
    const firstProfessorName = professorNameList[0];
    const professor = await findProfessor(firstProfessorName != null ? firstProfessorName : "");
    if (professor) {
      const popup = initPopup(professor);
      target.appendChild(popup);
      target.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      return;
    }
    professorNameList.forEach(async (professorName) => {
      const professor2 = await findProfessor(professorName != null ? professorName : "");
      if (professor2) {
        target.style.cssText += "background-color: #D4E9B8";
      }
    });
  });
};
var handleLargeExpandedTargets = (targets) => {
  targets.forEach(async (target) => {
    const sectionChildren = [...Array.from(target.children)];
    const newChildren = await Promise.all(sectionChildren.map(async (child) => {
      var _a;
      const professor = await findProfessor((_a = child.innerText) != null ? _a : "");
      if (!professor || child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
        return child;
      }
      const popup = initPopup(professor);
      child.appendChild(popup);
      child.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      return child;
    }));
    target.replaceChildren(...newChildren);
  });
};

// src/studentCenter.ts
function studentCenter() {
  const sectionArr = document.querySelectorAll('span[id*="MTG_INSTR$"]');
  sectionArr.forEach(async (section) => {
    var _a, _b;
    const hasPopups = (_a = section.parentElement) == null ? void 0 : _a.querySelector(`.${POPUP_PARENT_CONTAINER_CLASS}`);
    if (hasPopups) {
      return;
    }
    const professorList = [
      ...new Set(((_b = section.textContent) != null ? _b : "").split(",").map((element) => element.trim()))
    ];
    if (professorList.length == 1) {
      const profContainer = section.parentNode;
      multipleProfessors(profContainer, professorList);
    } else {
      multipleProfessors(section, professorList);
    }
  });
}
var multipleProfessors = async (target, professorNameList) => {
  const newHtml = await Promise.all(professorNameList.map(async (professorName) => {
    const professor = await findProfessor(professorName);
    if (!professor) {
      return `<span>${professorName}</span>`;
    }
    const popup = initPopup(professor);
    return `<span class="${POPUP_PARENT_CONTAINER_CLASS}">
        ${professorName}
      <div class="${POPUP_CLASS}">${popup.innerHTML}</div></span>`;
  }));
  target.innerHTML = newHtml.join("");
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
