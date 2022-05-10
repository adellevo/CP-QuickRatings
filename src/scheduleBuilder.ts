import { initPopup } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";
import { Teacher } from "@polyratings/client";

export const scheduleBuilder = () => {
  const SmallTargets = document.querySelectorAll<HTMLElement>(
    ".cx-MuiGrid-root.css-11nzenr.cx-MuiGrid-container.cx-MuiGrid-item dl:first-child > dd"
  );

  const LargeUnexpandedTargets = document.querySelectorAll<HTMLElement>(
    ".cx-MuiButtonBase-root.cx-MuiExpansionPanelSummary-root > div:first-child > div:first-child > .cx-MuiGrid-container > div > div:first-child"
  );

  const LargeExpandedTargets = document.querySelectorAll<HTMLElement>(
    ".cx-MuiCollapse-container .cx-MuiGrid-root:nth-child(2) > div > div:nth-child(3) > p"
  );

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

const handleSmallTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (section) => {
    console.log(section.innerText);
    // if (section.innerText == "") {
    //   return;
    // }

    const professorList = [
      ...new Set((section.textContent ?? "").split(",").map((element) => element.trim())),
    ];

    // console.log(professorList);
    const validProfessors = professorList.map(
      async (professorName: string) => (await findProfessor(professorName ?? "")) != undefined
    );
    // if (section.children.length == professorList.length) {
    //   section.textContent = "";
    //   return;
    // }

    const sectionChildren = [...Array.from(section.children)];
    const popupsCreated = sectionChildren.filter((child) =>
      child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
    ).length;

    if (popupsCreated == validProfessors.length) {
      section.innerText = "";
      return;
    }

    // section.innerText = "";

    professorList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName ?? "");
      let uniqueProfessorDiv = document.createElement("div");
      uniqueProfessorDiv.innerText = professorName;

      //   const sectionChildren = [...Array.from(section.children)];
      //   let popupsCreated = 0;
      //   sectionChildren.forEach((child) => {
      //     if (child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
      //         popupsCreated += 1;
      //     } s
      //   });

      //   <dd class="cx-MuiTypography-root css-1xnpogb d-flex align-items-center pb-1 pr-1 cx-MuiTypography-body1"></dd>;

      //   while (popupsCreated != )

      //   if (section.children.length == professorList.length * 2) {
      //     section.innerText = "";
      //     return;
      //   }

      if (section.children.length < validProfessors.length) {
        section.appendChild(uniqueProfessorDiv);
        if (professor) {
          const popup = initPopup(professor);
          //   section.innerHTML += `<span class=${POPUP_PARENT_CONTAINER_CLASS}>${professorName}</span>`;
          //   uniqueProfessorSpan.innerText = section.innerText;
          uniqueProfessorDiv.appendChild(popup);
          uniqueProfessorDiv.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        }
      }
      // uniqueProfessorSpan.innerText = section.innerText;
      // if (professor) {
      //   const popup = initPopup(professor);
      //   uniqueProfessorSpan.appendChild(popup);
      //   uniqueProfessorSpan.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      // }
      // section.appendChild(uniqueProfessorSpan);
      // if (section.children.length != professorList.length * 2 - 1) {
      //   let comma = document.createElement("span");
      //   comma.innerText = ",\u00A0";
      //   section.appendChild(comma);
      // }
      //   }
    });
  });
};

//       if (i == 0) section.innerText = ""; // remove initial text with all profs combined together
//       let uniqueProf = document.createElement("span"); // create span for individual profs

//       } else if (platform == "SB") {
//         // if (section.children.length < profArr.length * 2) {
//         //   if (prof !== undefined) {
//         //     const link = getProfLink(prof);
//         //     uniqueProf.innerHTML = `<a href='${link}' target='_blank'>${professorName}</a>`;
//         //   } else {
//         //     uniqueProf.innerHTML = `${professorName}`;
//         //   }
//         //   section.appendChild(uniqueProf);
//         //   if (section.children.length != profArr.length * 2 - 1) {
//         //     let comma = document.createElement("span");
//         //     comma.innerText = ",\u00A0";
//         //     section.appendChild(comma);
//         //   }
//         // }

const handleLargeUnexpandedTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (section) => {
    const professorList = (section.textContent ?? "").split(",").map((element) => element.trim());

    // set background color to prompt for expansion
    professorList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName ?? "");
      if (professor) {
        section.style.cssText += "background-color: #D4E9B8";
        return;
      }
    });
  });
};

const handleLargeExpandedTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (section) => {
    const professorList = (section.textContent ?? "").split(",").map((element) => element.trim());
    const sectionChildren = [...Array.from(section.children)];

    professorList.forEach(async (professorName) => {
      let targetChild;
      for (let i = 0; i < sectionChildren.length; i++) {
        if ((sectionChildren[i] as HTMLElement).innerText == professorName) {
          targetChild = sectionChildren[i];
          break;
        }
      }

      // add popup if it doesn't already exist
      if (targetChild && !targetChild.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
        const professor = await findProfessor(professorName ?? "");
        if (professor) {
          const popup = initPopup(professor);
          targetChild.appendChild(popup);
          targetChild.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        }
      }
    });
  });
};
