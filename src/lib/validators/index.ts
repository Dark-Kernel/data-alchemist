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

export const validateUnknownReferences = (
  clients: Record<string, any>[],
  tasks: Record<string, any>[]
) => {
  const errors: string[] = [];
  const taskIds = new Set(tasks.map((t) => t.TaskID));
  for (const client of clients) {
    if (typeof client.RequestedTaskIDs === "string") {
      const requestedIds = client.RequestedTaskIDs.split(",");
      for (const id of requestedIds) {
        if (!taskIds.has(id.trim())) {
          errors.push(`Client ${client.ClientID} requests unknown task: ${id}`);
        }
      }
    }
  }
  return errors;
};

export const validateSkillCoverage = (
  tasks: Record<string, any>[],
  workers: Record<string, any>[]
) => {
  const errors: string[] = [];
  const workerSkills = new Set(
    workers.flatMap((w) => (typeof w.Skills === "string" ? w.Skills.split(",").map((s: string) => s.trim()) : []))
  );
  for (const task of tasks) {
    if (typeof task.RequiredSkills === "string") {
      const requiredSkills = task.RequiredSkills.split(",");
      for (const skill of requiredSkills) {
        if (!workerSkills.has(skill.trim())) {
          errors.push(`Task ${task.TaskID} requires unknown skill: ${skill}`);
        }
      }
    }
  }
  return errors;
};

export const validateOverloadedWorkers = (workers: Record<string, any>[]) => {
  const errors: string[] = [];
  for (const worker of workers) {
    if (worker.AvailableSlots && worker.AvailableSlots.length < worker.MaxLoadPerPhase) {
      errors.push(`Worker ${worker.WorkerID} is overloaded.`);
    }
  }
  return errors;
};

export const validateCircularCoRunGroups = (rules: Record<string, any>[]) => {
  const errors: string[] = [];
  const coRunRules = rules.filter((r) => r.type === "coRun");
  for (const rule of coRunRules) {
    const graph = new Map<string, string[]>();
    for (const task of rule.tasks) {
      graph.set(task, []);
    }
    for (let i = 0; i < rule.tasks.length - 1; i++) {
      graph.get(rule.tasks[i])!.push(rule.tasks[i + 1]);
    }
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    for (const task of rule.tasks) {
      if (isCyclic(task, visited, recursionStack, graph)) {
        errors.push(`Circular co-run group found in rule: ${rule.tasks.join(" -> ")}`);
        break;
      }
    }
  }
  return errors;
};

function isCyclic(
  task: string,
  visited: Set<string>,
  recursionStack: Set<string>,
  graph: Map<string, string[]>
): boolean {
  visited.add(task);
  recursionStack.add(task);
  const neighbors = graph.get(task);
  if (neighbors) {
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (isCyclic(neighbor, visited, recursionStack, graph)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
  }
  recursionStack.delete(task);
  return false;
}

export const validateQualificationLevel = (
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

export const validatePhaseSlotSaturation = (
  tasks: Record<string, any>[],
  workers: Record<string, any>[]
) => {
  const errors: string[] = [];
  const phaseSlots: Record<number, number> = {};
  for (const worker of workers) {
    if (typeof worker.AvailableSlots === "string") {
      try {
        const slots = JSON.parse(worker.AvailableSlots);
        if (Array.isArray(slots)) {
          for (const slot of slots) {
            phaseSlots[slot] = (phaseSlots[slot] || 0) + 1;
          }
        }
      } catch {
        // Ignore malformed lists, as they are handled by a different validator
      }
    }
  }
  const phaseDurations: Record<number, number> = {};
  for (const task of tasks) {
    if (typeof task.PreferredPhases === "string") {
      try {
        const phases = JSON.parse(task.PreferredPhases);
        if (Array.isArray(phases)) {
          for (const phase of phases) {
            phaseDurations[phase] = (phaseDurations[phase] || 0) + task.Duration;
          }
        }
      } catch {
        // Ignore malformed lists, as they are handled by a different validator
      }
    }
  }
  for (const phase in phaseDurations) {
    if (phaseDurations[phase] > (phaseSlots[phase] || 0)) {
      errors.push(`Phase ${phase} is oversaturated.`);
    }
  }
  return errors;
};

export const validateMaxConcurrencyFeasibility = (
  tasks: Record<string, any>[],
  workers: Record<string, any>[]
) => {
  const errors: string[] = [];
  for (const task of tasks) {
    const qualifiedWorkers = workers.filter((w) => {
      if (typeof w.Skills === "string" && typeof task.RequiredSkills === "string") {
        const workerSkills = new Set(w.Skills.split(",").map((s: string) => s.trim()));
        const requiredSkills = new Set(task.RequiredSkills.split(",").map((s: string) => s.trim()));
        return [...requiredSkills].every((skill) => workerSkills.has(skill));
      }
      return false;
    });
    if (task.MaxConcurrent > qualifiedWorkers.length) {
      errors.push(
        `Task ${task.TaskID} has a max concurrency of ${task.MaxConcurrent}, but only ${qualifiedWorkers.length} qualified workers are available.`
      );
    }
  }
  return errors;
};

export const validateConflictingRules = (
  rules: Record<string, any>[],
  tasks: Record<string, any>[]
) => {
  const errors: string[] = [];
  console.log(tasks);
  const taskPhaseWindows = new Map<string, number[]>();

  // First, extract phase-window rules
  for (const rule of rules) {
    if (rule.type === "phase-window" && rule.tasks) {
      const phases = rule.phases; // Assuming phases are already normalized to an array of numbers
      for (const taskId of rule.tasks) {
        if (taskPhaseWindows.has(taskId)) {
          errors.push(
            `Task ${taskId} has multiple phase-window rules, which is ambiguous.`
          );
        }
        taskPhaseWindows.set(taskId, phases);
      }
    }
  }

  // Check for conflicts between co-run rules and phase-window rules
  for (const rule of rules) {
    if (rule.type === "co-run" || rule.type === "coRun" && rule.tasks) {
      const coRunTasks = rule.tasks;
      let intersection: number[] | null = null;

      for (const taskId of coRunTasks) {
        const window = taskPhaseWindows.get(taskId);
        if (window) {
          if (intersection === null) {
            intersection = window;
          } else {
            intersection = intersection.filter((phase) => window.includes(phase));
          }
        }
      }

      if (intersection && intersection.length === 0) {
        errors.push(
          `Co-run rule for tasks [${coRunTasks.join(
            ", "
          )}] has a conflict. Their phase-window rules have no common phases.`
        );
      }
    }
  }

  return errors;
};
