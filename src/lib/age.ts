export function calculerAge(dateNaissance: string) {
  const naissance = new Date(dateNaissance);
  const aujourdHui = new Date();
  let age = aujourdHui.getFullYear() - naissance.getFullYear();
  const pasEncoreAnniversaire =
    aujourdHui.getMonth() < naissance.getMonth() ||
    (aujourdHui.getMonth() === naissance.getMonth() &&
      aujourdHui.getDate() < naissance.getDate());
  if (pasEncoreAnniversaire) age--;
  return age;
}
