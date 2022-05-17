import { initPopup, POPUP_CLASS } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";

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

    const newHTML = await Promise.all(
      professorNameList.map(async (professorName) => {
        const professor = await findProfessor(professorName);
        if (!professor) {
          return `<span style="display:inline-block;padding-right:12px">${professorName}</span>`;
        }
        const popup = initPopup(professor);
        return `<span style="margin-right:10px" class="${POPUP_PARENT_CONTAINER_CLASS}">
          ${professorName}
        <div class="${POPUP_CLASS}">${popup.innerHTML}</div></span>`;
      })
    );
    target.innerHTML = newHTML.join("");
  });
};

const handleLargeUnexpandedTargets = (targets: HTMLElement[]) => {
  targets.forEach(async (target) => {
    if (target.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
      return;
    }

    const professorNameList = (target.textContent ?? "")
      .split(",")
      .map((element) => element.trim());

    // set background color to prompt for expansion
    for (let i = 0; i < professorNameList.length; i++) {
      const professorName = professorNameList[i];
      const professor = await findProfessor(professorName ?? "");
      if (professor) {
        target.style.cssText += "background-color: #D4E9B8";
        return;
      }
    }
  });
};

const handleLargeExpandedTargets = (targets: HTMLElement[]) => {
  targets.forEach(async (target) => {
    const sectionChildren = [...Array.from(target.children)] as HTMLElement[];
    // avoid spam creation of popups
    const childrenVisited = sectionChildren.filter((child) =>
      child.classList.contains("visited")
    ).length;
    if (childrenVisited == sectionChildren.length) {
      return;
    }

    const newChildren = await Promise.all(
      sectionChildren.map(async (child) => {
        child.classList.add("visited");
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

    // update children with popups
    target.replaceChildren(...newChildren);
  });
};
