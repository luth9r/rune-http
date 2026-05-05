/**
 * Generates a unique name by appending (n) if the name already exists in the list
 */
export function getUniqueName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) {
    return name;
  }

  let counter = 1;
  let newName = `${name} (${counter})`;
  
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${name} (${counter})`;
  }
  
  return newName;
}
