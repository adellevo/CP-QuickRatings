import { initPopup, POPUP_CLASS } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";
import { Teacher } from "@polyratings/client";

export function studentCenter() {
  const sectionArr = document.querySelectorAll<HTMLElement>('span[id*="MTG_INSTR$"]'); // array of sections
  sectionArr.forEach(async (target) => {
    // Go one up to catch the single professor case
    const hasPopups = target.parentElement?.querySelector(`.${POPUP_PARENT_CONTAINER_CLASS}`);
    if (!hasPopups) {
      const professorNameList = [
        ...new Set((target.textContent ?? "").split(",").map((element) => element.trim())),
      ];

      const professorContainer =
        professorNameList.length == 1 ? (target!.parentNode! as HTMLElement) : target;
      createPopups(professorContainer, professorNameList);
    }
  });
}

const createPopups = async (target: HTMLElement, professorNameList: string[]) => {
  const newHTML = await Promise.all(
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
  target.innerHTML = newHTML.join("");
};
