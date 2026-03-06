import { buildRoleLibrary } from "./role-library-utils";

describe("buildRoleLibrary", () => {
  it("maps role names, timings and optional wake rules", () => {
    const result = buildRoleLibrary([
      {
        id: "seer",
        name: " Seherin ",
        timing: "night",
      },
      {
        id: "wolfpack",
        name: "Wolfteam",
        timing: "night",
        wakeRule: {
          schedule: "from_night_one",
          factionID: "wolves",
          wakeAsFaction: true,
        },
      },
    ]);

    expect(result.customRoles).toEqual({
      seer: "Seherin",
      wolfpack: "Wolfteam",
    });
    expect(result.roleTimings).toEqual({
      seer: "night",
      wolfpack: "night",
    });
    expect(result.roleNightWakeRules).toEqual({
      wolfpack: {
        schedule: "from_night_one",
        factionID: "wolves",
        wakeAsFaction: true,
      },
    });
  });

  it("compacts long names and removes parenthesis suffixes", () => {
    const result = buildRoleLibrary([
      {
        id: "very-long",
        name: "Verrückter Zurechnungsfähiger Lehrling des Dorfes (optional)",
        timing: "day",
      },
    ]);

    const compactName = result.customRoles["very-long"];
    expect(compactName).not.toContain("(optional)");
    expect(compactName.length).toBeLessThanOrEqual(22);
  });
});
