import type { Teacher } from "@polyratings/client";

const POPUP_PARENT_CONTAINER_CLASS = "polyratings-popup-container";

/* ---- student center ---- */
const addEvalSC = () => {
  const sectionArr = document.querySelectorAll<HTMLElement>('span[id*="MTG_INSTR$"]'); // array of sections
  sectionArr.forEach((section) => {
    let profArr: string[] | null = findProfessorName(section.innerText); // array of profs for that section
    if (profArr) {
      if (section.parentNode) {
        let profContainer: HTMLElement | null | undefined = section.parentElement?.parentElement;
        if (profContainer) {
          profContainer.classList.add("parContainer");
          getProfInfo(profContainer, profArr, section, "SC", "all");
        }
      }
    }
  });
};

/* ---- schedule builder ---- */
const getSBProfs = (section: HTMLElement, bwSize: string) => {
  let profArr = findProfessorName(section.innerText);
  if (profArr) {
    let profContainer = section.parentElement;
    if (profContainer) {
      profContainer.classList.add("parContainer");
      getProfInfo(profContainer, profArr, section, "SB", bwSize);
    }
  }
};

// parse elements for smaller browser widths in SB
const smallerBW = (sectionInfoContainer: HTMLCollection | null) => {
  if (sectionInfoContainer) {
    for (let i = 0; i < sectionInfoContainer.length; i++) {
      let sectionInfo = sectionInfoContainer.item(i);
      if (sectionInfo != undefined) {
        let section: HTMLElement | null = sectionInfo.getElementsByTagName("dd").item(0);
        if (section) {
          getSBProfs(section, "small");
        }
      }
    }
  }
};

// parse elements for larger browser widths in SB
const largerBW = (sectionInfoContainer: HTMLCollection) => {
  if (sectionInfoContainer != undefined) {
    for (let i = 0; i < sectionInfoContainer.length; i++) {
      let sectionInfo: HTMLCollection = sectionInfoContainer[i].getElementsByClassName(
        "cx-MuiTypography-root css-w00cnv cx-MuiTypography-body1"
      );
      let labels: HTMLCollection = sectionInfoContainer[i].getElementsByClassName(
        " cx-MuiTypography-root cx-MuiTypography-body1 cx-MuiTypography-colorTextSecondary"
      );
      if (labels != undefined && sectionInfo != undefined) {
        let labelArr: string[] = [];
        for (let i = 0; i < labels.length; i++) {
          labelArr.push((labels[i] as HTMLElement).innerText);
        }
        const index: number = labelArr.findIndex((label) => label === "Instructor:");
        let section: Element | null = sectionInfo.item(index);
        if (section) {
          getSBProfs(section as HTMLElement, "large");
        }
      }
    }
  }
};

const addEvalSB = () => {
  let iframe = document.getElementById("ptifrmtgtframe") as HTMLIFrameElement;
  if (iframe) {
    if (iframe.contentDocument != undefined) {
      let iframeBody = iframe.contentDocument.body;
      if (iframeBody != undefined) {
        let sectionsList = iframeBody.querySelectorAll('[aria-label="Sections List"]')[0];
        if (sectionsList != undefined) {
          const sbwClasses = "cx-MuiGrid-root css-11nzenr  cx-MuiGrid-container cx-MuiGrid-item";
          const lbwClasses = "cx-MuiGrid-root cx-MuiGrid-container cx-MuiGrid-spacing-xs-1";
          smallerBW(sectionsList.getElementsByClassName(sbwClasses));
          largerBW(sectionsList.getElementsByClassName(lbwClasses));
        }
      }
    }
  }
};

/* ---- general ---- */

const initPopup = (prof: Teacher): HTMLElement => {
  // create popup
  const tempararyDiv = document.createElement("div");

  const popupHtml = `
  <div class="polyratings-popup">
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

  tempararyDiv.innerHTML = popupHtml;

  return tempararyDiv.children[0] as HTMLElement;
};

// returns link to professor's rating page
const getProfLink = (prof: Teacher): string => `https://polyratings.dev/teacher/${prof.id}`;

const getProfInfo = async (
  profContainer: HTMLElement,
  profArr: string[],
  section: HTMLElement,
  platform: string,
  bwSize: string
) => {
  for (let [i, professorName] of profArr.entries()) {
    // const [firstName, lastName] = professorName.split(" ");
    const [firstName, lastName] = professorName.split(/(?<=^\S+)\s/);
    const prof = await findProfessor(firstName, lastName);

    // only one prof
    if (profArr.length == 1) {
      if (prof !== undefined) {
        if (platform == "SC" && profContainer.children.length === 1) {
          const popup = initPopup(prof);
          profContainer.appendChild(popup);
          profContainer.classList.add(POPUP_PARENT_CONTAINER_CLASS);
          section.style.cssText +=
            "display:flex;max-width:fit-content;background-color: #D4E9B8;margin-top:10px";
        } else if (platform == "SB") {
          const link: string = getProfLink(prof);
          if (profContainer.children.length === 2 && bwSize === "small") {
            section.innerHTML = `<a href='${link}' target='_blank'> ${professorName} </a>`;
          } else if (profContainer.children.length === 1 && bwSize === "large") {
            section.innerHTML = `<span><a href='${link}' target='_blank'> ${professorName} </a><span>`;
          }
        }
      }
    }

    // multiple profs
    else {
      if (i == 0) section.innerText = ""; // remove initial text with all profs combined together
      let uniqueProf = document.createElement("span"); // create span for individual profs

      if (platform == "SC") {
        if (section.children.length < profArr.length) {
          uniqueProf.innerHTML = `${professorName}<br>`;
          section.appendChild(uniqueProf);

          // append popup to container
          if (prof !== undefined) {
            uniqueProf.style.cssText += "background-color: #D4E9B8; margin-bottom: 4px;";
            const popup = initPopup(prof);
            profContainer.appendChild(popup);
          }
        }
      } else if (platform == "SB") {
        if (section.children.length < profArr.length * 2) {
          if (prof !== undefined) {
            const link = getProfLink(prof);
            uniqueProf.innerHTML = `<a href='${link}' target='_blank'>${professorName}</a>`;
          } else {
            uniqueProf.innerHTML = `${professorName}`;
          }
          section.appendChild(uniqueProf);
          if (section.children.length != profArr.length * 2 - 1) {
            let comma = document.createElement("span");
            comma.innerText = ",\u00A0";
            section.appendChild(comma);
          }
        }
      }
    }
  }
};

/**
 * returns array of professors
 */
const findProfessorName = (name: string): string[] | null => {
  if (name === "To be Announced" || name === "Staff") {
    return null;
  }
  return name.split(",").map((item) => item.trim());
};

const findProfessor = async (firstName: string, lastName: string) => {
  const allProfessors = await getProfessorRatings();
  return allProfessors.find((prof) => prof.firstName === firstName && prof.lastName === lastName);
};

let profs: Teacher[] = [];
const getProfessorRatings = async () => {
  if (profs.length) {
    return [...profs];
  }

  const githubRes = await fetch(
    "https://api.github.com/repos/Polyratings/Polyratings-data/contents/professor-list.json?ref=data",
    {
      headers: {
        accept: "application/vnd.github.v3.raw",
      },
    }
  );
  if (githubRes.status != 200) {
    console.log("error, status code " + githubRes.status);
    return [];
  }

  profs = await githubRes.json();
  return [...profs];
};

const main = async () => {
  while (true) {
    addEvalSC();
    addEvalSB();

    // Sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main();
