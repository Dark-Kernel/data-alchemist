export const validateMissingColumns = (data: Record<string, any>[], requiredColumns: string[]) => {
  const errors: string[] = [];
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    for (const col of requiredColumns) {
      if (!columns.includes(col)) {
        errors.push(`Missing required column: ${col}`);
      }
    }
  }
  return errors;
};

export const validateDuplicateIds = (data: Record<string, any>[], idColumn: string) => {
  const errors: string[] = [];
  const ids = new Set();
  for (const row of data) {
    const id = row[idColumn];
    if (ids.has(id)) {
      errors.push(`Duplicate ID found: ${id}`);
    }
    ids.add(id);
  }
  return errors;
};

export const validateOutOfRange = (
  data: Record<string, any>[],
  column: string,
  min: number,
  max: number
) => {
  const errors: string[] = [];
  for (const row of data) {
    const value = row[column];
    if (value < min || value > max) {
      errors.push(`Value out of range for ${column}: ${value}`);
    }
  }
  return errors;
};

export const validateMalformedLists = (data: Record<string, any>[], column: string) => {
  const errors: string[] = [];
  for (const row of data) {
    const value = row[column];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          errors.push(`Malformed list in ${column}: ${value}`);
        }
      } catch {
        errors.push(`Malformed list in ${column}: ${value}`);
      }
    }
  }
  return errors;
};

export const validateBrokenJson = (data: Record<string, any>[], column: string) => {
  const errors: string[] = [];
  for (const row of data) {
    const value = row[column];
    if (typeof value === "string") {
      try {
        JSON.parse(value);
      } catch {
        errors.push(`Broken JSON in ${column}: ${value}`);
      }
    }
  }
  return errors;
};