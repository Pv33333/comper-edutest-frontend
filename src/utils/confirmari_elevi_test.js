// src/utils/confirmari_elevi_test.js

export function populateConfirmariElevi() {
  const confirmari = [
    {
      numeElev: "Ion Popescu",
      clasa: "Clasa a V-a",
      materie: "Matematică",
      test: "Test evaluare capitol 3",
      dataConfirmare: "2025-08-01"
    },
    {
      numeElev: "Maria Ionescu",
      clasa: "Clasa a VI-a",
      materie: "Română",
      test: "Recapitulare semestru",
      dataConfirmare: "2025-08-02"
    }
  ];

  localStorage.setItem("confirmari_elevi", JSON.stringify(confirmari));
}