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
    const professorList = [
      ...new Set(
        (section.textContent ?? "").split(",").map((element) => element.trim())
      ),
    ];
    const validProfessors = professorList.map(
      async (professorName: string) =>
        (await findProfessor(professorName ?? "")) != undefined
    );
    const sectionChildren = [...Array.from(section.children)];
    const popupsCreated = sectionChildren.filter((child) =>
      child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
    ).length;

    if (popupsCreated >= validProfessors.length) {
      return;
    }

    professorList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName ?? "");
      if (section.children.length <= professorList.length) {
        let uniqueProfessorSpan = document.createElement("span");
        uniqueProfessorSpan.innerHTML = `${professorName}<br>`;
        section.appendChild(uniqueProfessorSpan);

        // append popup to container
        if (professor) {
          //   uniqueProfessorSpan.style.cssText += "background-color: #D4E9B8; margin-bottom: 4px;";

          const popup = initPopup(professor);
          uniqueProfessorSpan.appendChild(popup);
          uniqueProfessorSpan.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        }
      }
    });

    section.innerHTML = section.innerHTML.substring(
      0,
      section.innerHTML.indexOf("<")
    );
  });
};

const handleLargeUnexpandedTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (section) => {
    const professorList = (section.textContent ?? "")
      .split(",")
      .map((element) => element.trim());

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
    const professorList = (section.textContent ?? "")
      .split(",")
      .map((element) => element.trim());
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
      if (
        targetChild &&
        !targetChild.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
      ) {
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
