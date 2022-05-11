import { initPopup } from "./popup";
import { findProfessor } from "./professors";
import { POPUP_PARENT_CONTAINER_CLASS } from "./popup";
import { Teacher } from "@polyratings/client";

export function studentCenter() {
  const sectionArr = document.querySelectorAll<HTMLElement>(
    'span[id*="MTG_INSTR$"]'
  ); // array of sections
  sectionArr.forEach(async (section) => {
    const professorList = [
      ...new Set(
        (section.textContent ?? "").split(",").map((element) => element.trim())
      ),
    ];

    if (professorList.length == 1) {
      oneProfessor(section);
    } else {
      multipleProfessors(section, professorList);
    }
  });
}

const oneProfessor = async (section: HTMLElement) => {
  const professor = await findProfessor(section.textContent ?? "");
  const profContainer = section!.parentNode!.parentNode! as HTMLElement;
  if (
    !professor ||
    profContainer.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
  ) {
    // Can't do anything since we did not find a professor or we already added the popup
    return;
  }
  const popup = initPopup(professor);
  profContainer.appendChild(popup);
  profContainer.classList.add(POPUP_PARENT_CONTAINER_CLASS);
};

const multipleProfessors = async (
  section: HTMLElement,
  professorList: Array<string>
) => {
  const validProfessors = professorList.map(
    async (professorName: string) =>
      (await findProfessor(professorName ?? "")) != undefined
  );

  if (section.innerText == "") {
    const sectionChildren = [...Array.from(section.children)];
    const popupsCreated = sectionChildren.filter((child) =>
      child.classList.contains(POPUP_PARENT_CONTAINER_CLASS)
    ).length;

    if (popupsCreated == validProfessors.length) {
      return;
    }
  }

  professorList.forEach(async (professorName) => {
    const professor = await findProfessor(professorName ?? "");
    if (section.children.length <= professorList.length) {
      let uniqueProfessorSpan = document.createElement("span");
      uniqueProfessorSpan.innerHTML = `${professorName}<br>`;
      section.appendChild(uniqueProfessorSpan);

      // append popup to container
      if (professor) {
        const popup = initPopup(professor);
        uniqueProfessorSpan.appendChild(popup);
        uniqueProfessorSpan.classList.add(POPUP_PARENT_CONTAINER_CLASS);
      }
    }
  });

  section.innerText = "";
};
