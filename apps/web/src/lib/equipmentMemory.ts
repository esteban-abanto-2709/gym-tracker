// Recuerda el último equipo usado por ejercicio (opción B: default = último uso).
// Vive solo en el cliente; un dispositivo nuevo arranca en blanco (null = "sin
// especificar") hasta el primer registro. ponytail: localStorage, no DB.
const KEY = "gymtrack-equipment-by-exercise";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getLastEquipment(exerciseId: string): string | null {
  return readMap()[exerciseId] ?? null;
}

export function rememberEquipment(
  exerciseId: string,
  equipmentId: string | null,
): void {
  if (typeof window === "undefined") return;
  const map = readMap();
  if (equipmentId) {
    map[exerciseId] = equipmentId;
  } else {
    delete map[exerciseId];
  }
  window.localStorage.setItem(KEY, JSON.stringify(map));
}
