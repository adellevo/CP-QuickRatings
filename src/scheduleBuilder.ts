import { initPopup, POPUP_CLASS } from "./popup";
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
  targets.forEach(async (target) => {
    target.style.overflow = "visible";
    const professorNameList = [
      ...new Set((target.textContent ?? "").split(",").map((element) => element.trim())),
    ];

    const sectionChildren = [...Array.from(target.children)];
    const isPopupCreated = sectionChildren.find((child) =>
      child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
    );
    if (isPopupCreated) {
      return;
    }

    const newHtml = await Promise.all(
      professorNameList.map(async (professorName) => {
        const professor = await findProfessor(professorName);
        if (!professor) {
          return `<span>${professorName}</span>`;
        }
        const popup = initPopup(professor);
        return `<span class="${POPUP_PARENT_CONTAINER_CLASS}">
          ${professorName}
        <div class="${POPUP_CLASS}">${popup.innerHTML}</div></span>`;
      })
    );
    target.innerHTML = newHtml.join("");
  });
};

const handleLargeUnexpandedTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (target) => {
    if (target.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
      return;
    }

    const professorNameList = (target.textContent ?? "")
      .split(",")
      .map((element) => element.trim());

    const firstProfessorName = professorNameList[0] as string | undefined;
    const professor = await findProfessor(firstProfessorName ?? "");
    if (professor) {
      const popup = initPopup(professor);
      target.appendChild(popup);
      target.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      return;
    }

    // set background color to prompt for expansion if first professor is not found but others are
    professorNameList.forEach(async (professorName) => {
      const professor = await findProfessor(professorName ?? "");
      if (professor) {
        target.style.cssText += "background-color: #D4E9B8";
      }
    });
  });
};

const handleLargeExpandedTargets = (targets: Array<HTMLElement>) => {
  targets.forEach(async (target) => {
    const sectionChildren = [...Array.from(target.children)] as HTMLElement[];

    const newChildren = await Promise.all(
      sectionChildren.map(async (child) => {
        const professor = await findProfessor(child.innerText ?? "");
        if (!professor || child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
          return child;
        }
        const popup = initPopup(professor);
        child.appendChild(popup);
        child.classList.add(POPUP_PARENT_CONTAINER_CLASS);
        return child;
      })
    );

    target.replaceChildren(...newChildren);
  });
};
