export type ExampleDeckTemplate = {
    id: string
    name: string
    pickedRoles: { [key: string]: number }
    customRoles?: { [key: string]: string }
    availableFactions?: { [key: string]: string }
    roleTimings?: { [key: string]: RoleTiming }
    roleNightWakeRules?: { [key: string]: RoleNightWakeRule }
}
