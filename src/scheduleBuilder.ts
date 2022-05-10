import { initPopup } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";
import { Teacher } from "@polyratings/client";

export const scheduleBuilder = () => {
  const smallerTargets = document.querySelectorAll<HTMLElement>(
    ".cx-MuiGrid-root.css-11nzenr.cx-MuiGrid-container.cx-MuiGrid-item dl:first-child > dd"
  );

  const largerTargetsUnexpanded = document.querySelectorAll<HTMLElement>(
    ".cx-MuiButtonBase-root.cx-MuiExpansionPanelSummary-root > div:first-child > div:first-child > .cx-MuiGrid-container > div > div:first-child"
  );

  const largerTargetsExpanded = document.querySelectorAll<HTMLElement>(
    ".cx-MuiCollapse-container .cx-MuiGrid-root:nth-child(2) > div > div:nth-child(3) > p"
  );

  //   const targets = [
  //     ...Array.from(smallerTargets),
  //     ...Array.from(largerTargetsUnexpanded),
  //     ...Array.from(largetTargetsExpanded),
  //   ];

  if (largerTargetsUnexpanded) {
    const targets = [...Array.from(largerTargetsUnexpanded)];
    handleLargerTargetsUnexpanded(targets);
  }

  if (largerTargetsExpanded) {
    const targets = [...Array.from(largerTargetsExpanded)];
    handleLargerTargetsExpanded(targets);
  }
};

const handleLargerTargetsUnexpanded = (targets: Array<HTMLElement>) => {
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

const handleLargerTargetsExpanded = (targets: Array<HTMLElement>) => {
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
