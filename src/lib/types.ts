
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string;
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;
  AvailableSlots: string;
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName:string;
  Category: string;
  Duration: number;
  RequiredSkills: string;
  PreferredPhases: string;
  MaxConcurrent: number;
}

export interface Rule {
  type: "coRun" | "slotRestriction" | "loadLimit";
  tasks?: string[];
  group?: string;
  minCommonSlots?: number;
  maxSlotsPerPhase?: number;
}

export interface Weight {
  priorityLevel: number;
  fulfillment: number;
  fairness: number;
}

export interface AiError {
  ClientID?: string;
  WorkerID?: string;
  TaskID?: string;
  error: string;
}
