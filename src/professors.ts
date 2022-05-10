import type { Teacher } from "@polyratings/client";
/**
 * returns array of professors
 */
export const findProfessorName = (name: string): string[] | null => {
  if (name === "To be Announced" || name === "Staff") {
    return null;
  }
  return name.split(",").map((item) => item.trim());
};

export const findProfessor = async (name: string) => {
  const allProfessors = await getProfessorRatings();
  return allProfessors.find((prof) => prof.firstName + " " + prof.lastName === name);
};

let profs: Teacher[] = [];
export const getProfessorRatings = async () => {
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

// returns link to professor's rating page
export const getProfLink = (prof: Teacher): string => `https://polyratings.dev/teacher/${prof.id}`;
