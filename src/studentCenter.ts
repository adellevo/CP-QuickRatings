import { initPopup, POPUP_CLASS } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";
import { Teacher } from "@polyratings/client";

export function studentCenter() {
  const sectionArr = document.querySelectorAll<HTMLElement>('span[id*="MTG_INSTR$"]'); // array of sections
  sectionArr.forEach(async (section) => {
    // Go one up to catch the single professor case
    const hasPopups = section.parentElement?.querySelector(`.${POPUP_PARENT_CONTAINER_CLASS}`);
    if (hasPopups) {
      return;
    }
    const professorList = [
      ...new Set((section.textContent ?? "").split(",").map((element) => element.trim())),
    ];

    if (professorList.length == 1) {
      const profContainer = section!.parentNode! as HTMLElement;
      multipleProfessors(profContainer, professorList);
    } else {
      multipleProfessors(section, professorList);
    }
  });
}

const multipleProfessors = async (target: HTMLElement, professorNameList: string[]) => {
  const newHtml = await Promise.all(
    professorNameList.map(async (professorName) => {
      const professor = await findProfessor(professorName);
      if (!professor) {
        return `<span style="display:inline-block;padding-right:12px;margin-bottom:3px">${professorName}</span>`;
      }
      const popup = initPopup(professor);
      return `<span class="${POPUP_PARENT_CONTAINER_CLASS}">
        ${professorName}
      <div class="${POPUP_CLASS}">${popup.innerHTML}</div></span>`;
    })
  );
  target.innerHTML = newHtml.join("");
};
