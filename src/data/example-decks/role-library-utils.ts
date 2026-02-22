export type DeckRoleDefinition = {
    id: string
    name: string
    timing: RoleTiming
    wakeRule?: RoleNightWakeRule
}

const MAX_ROLE_NAME_LENGTH = 22

const compactRoleName = (rawName: string): string => {
    const normalizedName = rawName.trim().replace(/\s+/g, " ")
    const nameWithoutSuffix = normalizedName.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim()
    const baseName = nameWithoutSuffix.length > 0 ? nameWithoutSuffix : normalizedName

    if (baseName.length <= MAX_ROLE_NAME_LENGTH) {
        return baseName
    }

    const abbreviationAdjustedName = baseName
        .replace("Verrückter", "Verr.")
        .replace("Zurechnungsfähiger", "Zurechn.")
        .replace("Lehrling des", "Lehrling")

    if (abbreviationAdjustedName.length <= MAX_ROLE_NAME_LENGTH) {
        return abbreviationAdjustedName
    }

    return `${abbreviationAdjustedName.slice(0, MAX_ROLE_NAME_LENGTH - 1).trimEnd()}.`
}

export const buildRoleLibrary = (roles: DeckRoleDefinition[]): {
    customRoles: { [key: string]: string }
    roleTimings: { [key: string]: RoleTiming }
    roleNightWakeRules: { [key: string]: RoleNightWakeRule }
} => {
    const customRoles: { [key: string]: string } = {}
    const roleTimings: { [key: string]: RoleTiming } = {}
    const roleNightWakeRules: { [key: string]: RoleNightWakeRule } = {}

    roles.forEach(role => {
        customRoles[role.id] = compactRoleName(role.name)
        roleTimings[role.id] = role.timing
        if (role.wakeRule) {
            roleNightWakeRules[role.id] = role.wakeRule
        }
    })

    return {
        customRoles,
        roleTimings,
        roleNightWakeRules,
    }
}
