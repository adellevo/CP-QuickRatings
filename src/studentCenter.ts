import { initPopup } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";

export function studentCenter() {
  const sectionArr = document.querySelectorAll<HTMLElement>('span[id*="MTG_INSTR$"]'); // array of sections
  sectionArr.forEach(async (section) => {
    const professor = await findProfessor(section.textContent ?? "");
    const profContainer = section!.parentNode!.parentNode! as HTMLElement;
    if (!professor || profContainer.classList.contains(POPUP_PARENT_CONTAINER_CLASS)) {
      // Can't do anything since we did not find a professor or we already added the popup
      return;
    }
    const popup = initPopup(professor);
    profContainer.appendChild(popup);
    profContainer.classList.add(POPUP_PARENT_CONTAINER_CLASS);
    // setColorVarsForRating(professor.overallRating, profContainer);
  });
}
