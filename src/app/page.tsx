"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/custom/file-uploader";
import { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { DataGrid } from "@/components/custom/data-grid";
import { textEditor } from "react-data-grid";
import {
  validateMissingColumns,
  validateDuplicateIds,
  validateOutOfRange,
  validateMalformedLists,
  validateBrokenJson,
  validateUnknownReferences,
  validateSkillCoverage,
  validateOverloadedWorkers,
  validateCircularCoRunGroups,
  validatePhaseSlotSaturation,
  validateMaxConcurrencyFeasibility,
  validateConflictingRules,
  validateQualificationLevel,
} from "@/lib/validators";
import { SearchBar } from "@/components/custom/search-bar";
import { RuleEditor } from "@/components/custom/rule-editor";
import { NaturalLanguageRuler } from "@/components/custom/natural-language-ruler";
import { PrioritizationEditor } from "@/components/custom/prioritization-editor";
import { saveAs } from "file-saver";
import { Client, Worker, Task, Rule, Weight, AiError } from "@/lib/types";

const columnsClients = [
  { key: "ClientID", name: "Client ID", renderEditCell: textEditor },
  { key: "ClientName", name: "Client Name", renderEditCell: textEditor },
  { key: "PriorityLevel", name: "Priority Level", renderEditCell: textEditor },
  { key: "RequestedTaskIDs", name: "Requested Task IDs", renderEditCell: textEditor },
  { key: "GroupTag", name: "Group Tag", renderEditCell: textEditor },
  { key: "AttributesJSON", name: "Attributes JSON", renderEditCell: textEditor },
];

const columnsWorkers = [
  { key: "WorkerID", name: "Worker ID", renderEditCell: textEditor },
  { key: "WorkerName", name: "Worker Name", renderEditCell: textEditor },
  { key: "Skills", name: "Skills", renderEditCell: textEditor },
  { key: "AvailableSlots", name: "Available Slots", renderEditCell: textEditor },
  { key: "MaxLoadPerPhase", name: "Max Load Per Phase", renderEditCell: textEditor },
  { key: "WorkerGroup", name: "Worker Group", renderEditCell: textEditor },
  { key: "QualificationLevel", name: "Qualification Level", renderEditCell: textEditor },
];

const columnsTasks = [
  { key: "TaskID", name: "Task ID", renderEditCell: textEditor },
  { key: "TaskName", name: "Task Name", renderEditCell: textEditor },
  { key: "Category", name: "Category", renderEditCell: textEditor },
  { key: "Duration", name: "Duration", renderEditCell: textEditor },
  { key: "RequiredSkills", name: "Required Skills", renderEditCell: textEditor },
  { key: "PreferredPhases", name: "Preferred Phases", renderEditCell: textEditor },
  { key: "MaxConcurrent", name: "Max Concurrent", renderEditCell: textEditor },
];

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [aiErrors, setAiErrors] = useState<(string | AiError)[]>([]);
  const [errorCells, setErrorCells] = useState<{ row: number; col: string }[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [weights, setWeights] = useState<Weight | {}>({});
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file: File, entity: "clients" | "workers" | "tasks") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (typeof data === "string") {
        const parsed = Papa.parse(data, { header: true });
        setData(entity, parsed.data as any[]);
      } else if (data instanceof ArrayBuffer) {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setData(entity, json as any[]);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.readAsArrayBuffer(file);
    }
  };

  const setData = (entity: "clients" | "workers" | "tasks", data: any[]) => {
    switch (entity) {
      case "clients":
        setClients(data as Client[]);
        setFilteredClients(data as Client[]);
        break;
      case "workers":
        setWorkers(data as Worker[]);
        setFilteredWorkers(data as Worker[]);
        break;
      case "tasks":
        setTasks(data as Task[]);
        setFilteredTasks(data as Task[]);
        break;
    }
  };

  const handleSearch = async (query: string, entity: "clients" | "workers" | "tasks") => {
    setLoading(true);
    const data = entity === "clients" ? clients : entity === "workers" ? workers : tasks;
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "search", payload: { query, data } }),
    });
    const filteredData = await response.json();
    switch (entity) {
      case "clients":
        setFilteredClients(filteredData);
        break;
      case "workers":
        setFilteredWorkers(filteredData);
        break;
      case "tasks":
        setFilteredTasks(filteredData);
        break;
    }
    setLoading(false);
  };

  const handleRuleAdd = (rule: Rule) => {
    setRules([...rules, rule]);
  };

  const handleRuleRemove = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleWeightsChange = useCallback((newWeights: Weight) => {
    setWeights(newWeights);
  }, []);

  const handleExport = () => {
    const clientsCsv = Papa.unparse(clients);
    const workersCsv = Papa.unparse(workers);
    const tasksCsv = Papa.unparse(tasks);

    const rulesJson = JSON.stringify({ rules, weights }, null, 2);

    saveAs(new Blob([clientsCsv], { type: "text/csv;charset=utf-8" }), "clients.csv");
    saveAs(new Blob([workersCsv], { type: "text/csv;charset=utf-8" }), "workers.csv");
    saveAs(new Blob([tasksCsv], { type: "text/csv;charset=utf-8" }), "tasks.csv");
    saveAs(new Blob([rulesJson], { type: "application/json;charset=utf-8" }), "rules.json");
  };

  const handleAiValidation = async () => {
    setLoading(true);
    const clientErrors = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate_data", payload: { data: clients, entityType: "client" } }),
    }).then(res => res.json());

    const workerErrors = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate_data", payload: { data: workers, entityType: "worker" } }),
    }).then(res => res.json());

    const taskErrors = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate_data", payload: { data: tasks, entityType: "task" } }),
    }).then(res => res.json());

    setAiErrors([...clientErrors, ...workerErrors, ...taskErrors]);
    setLoading(false);
  };

  const handleAiFix = async () => {
    setLoading(true);
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fix_errors", payload: { errors, clients, workers, tasks } }),
    }).then(res => res.json());
    setClients(response.clients);
    setFilteredClients(response.clients);
    setWorkers(response.workers);
    setFilteredWorkers(response.workers);
    setTasks(response.tasks);
    setFilteredTasks(response.tasks);
    setLoading(false);
  };

  const parseErrors = (
    errors: string[],
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
  ) => {
    const cells: { row: number; col: string }[] = [];
    errors.forEach(error => {
      let match;
      if ((match = error.match(/Duplicate ID found: (\w+)/))) {
        const id = match[1];
        const clientIndex = clients.findIndex(c => c.ClientID === id);
        if (clientIndex !== -1) {
          cells.push({ row: clientIndex, col: "ClientID" });
        }
        const workerIndex = workers.findIndex(w => w.WorkerID === id);
        if (workerIndex !== -1) {
          cells.push({ row: workerIndex, col: "WorkerID" });
        }
        const taskIndex = tasks.findIndex(t => t.TaskID === id);
        if (taskIndex !== -1) {
          cells.push({ row: taskIndex, col: "TaskID" });
        }
      } else if ((match = error.match(/Value out of range for (\w+): (\d+)/))) {
        const column = match[1];
        const value = match[2];
        const clientIndex = clients.findIndex(c => c.PriorityLevel === parseInt(value));
        if (clientIndex !== -1) {
          cells.push({ row: clientIndex, col: column });
        }
      } else if ((match = error.match(/Broken JSON in (\w+): (.*)/))) {
        const column = match[1];
        const value = match[2];
        const clientIndex = clients.findIndex(c => c.AttributesJSON === value);
        if (clientIndex !== -1) {
          cells.push({ row: clientIndex, col: column });
        }
      } else if ((match = error.match(/Client (\w+) requests unknown task: (\w+)/))) {
        const id = match[1];
        const rowIndex = clients.findIndex(c => c.ClientID === id);
        if (rowIndex !== -1) {
          cells.push({ row: rowIndex, col: "RequestedTaskIDs" });
        }
      } else if ((match = error.match(/Task (\w+) requires unknown skill: (\w+)/))) {
        const id = match[1];
        const rowIndex = tasks.findIndex(t => t.TaskID === id);
        if (rowIndex !== -1) {
          cells.push({ row: rowIndex, col: "RequiredSkills" });
        }
      } else if ((match = error.match(/Worker (\w+) is overloaded/))) {
        const id = match[1];
        const rowIndex = workers.findIndex(w => w.WorkerID === id);
        if (rowIndex !== -1) {
          cells.push({ row: rowIndex, col: "MaxLoadPerPhase" });
        }
      } else if ((match = error.match(/Task (\w+) has a max concurrency of (\d+), but only (\d+) qualified workers are available/))) {
        const id = match[1];
        const rowIndex = tasks.findIndex(t => t.TaskID === id);
        if (rowIndex !== -1) {
          cells.push({ row: rowIndex, col: "MaxConcurrent" });
        }
      }
    });
    return cells;
  };

  useEffect(() => {
    const allErrors: string[] = [];
    if (Array.isArray(clients) && clients.length > 0) {
      allErrors.push(...validateMissingColumns(clients, columnsClients.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(clients, "ClientID"));
      allErrors.push(...validateOutOfRange(clients, "PriorityLevel", 1, 5));
      allErrors.push(...validateBrokenJson(clients, "AttributesJSON"));
      if (Array.isArray(tasks) && tasks.length > 0) {
        allErrors.push(...validateUnknownReferences(clients, tasks));
      }
    }
    if (Array.isArray(workers) && workers.length > 0) {
      allErrors.push(...validateMissingColumns(workers, columnsWorkers.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(workers, "WorkerID"));
      allErrors.push(...validateMalformedLists(workers, "AvailableSlots"));
      allErrors.push(...validateOutOfRange(workers, "MaxLoadPerPhase", 0, Infinity));
      allErrors.push(...validateQualificationLevel(workers, "QualificationLevel", 1, 5));
      allErrors.push(...validateOverloadedWorkers(workers));
    }
    if (Array.isArray(tasks) && tasks.length > 0) {
      allErrors.push(...validateMissingColumns(tasks, columnsTasks.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(tasks, "TaskID"));
      allErrors.push(...validateOutOfRange(tasks, "Duration", 1, Infinity));
      if (Array.isArray(workers) && workers.length > 0) {
        allErrors.push(...validateSkillCoverage(tasks, workers));
        allErrors.push(...validatePhaseSlotSaturation(tasks, workers));
        allErrors.push(...validateMaxConcurrencyFeasibility(tasks, workers));
      }
    }
    if (Array.isArray(rules) && rules.length > 0) {
      allErrors.push(...validateCircularCoRunGroups(rules));
      if (Array.isArray(tasks) && tasks.length > 0) {
        allErrors.push(...validateConflictingRules(rules, tasks));
      }
    }

    setErrors(allErrors);
    setErrorCells(parseErrors(allErrors, clients, workers, tasks));
  }, [clients, workers, tasks, rules]);

  useEffect(() => {
    if (weights && "priorityLevel" in weights) {
      const sortedClients = [...clients].sort((a, b) => {
        const priorityA = a.PriorityLevel * weights.priorityLevel;
        const priorityB = b.PriorityLevel * weights.priorityLevel;
        return priorityB - priorityA;
      });
      setFilteredClients(sortedClients);
    }
  }, [clients, weights]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background">
        <h1 className="text-xl font-semibold">Data Alchemist</h1>
        <Button onClick={handleExport}>Export</Button>
      </header>
      <main className="flex flex-1 p-4 space-x-4">
        <div className="w-2/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="flex justify-between mb-4">
                <FileUploader onFileUpload={(file) => handleFileUpload(file, "clients")} />
                <SearchBar onSearch={(query) => handleSearch(query, "clients")} />
              </div>
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsClients} rows={filteredClients} onRowsChange={(rows) => { setClients(rows); setFilteredClients(rows); }} errorCells={errorCells} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workers</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="flex justify-between mb-4">
                <FileUploader onFileUpload={(file) => handleFileUpload(file, "workers")} />
                <SearchBar onSearch={(query) => handleSearch(query, "workers")} />
              </div>
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsWorkers} rows={filteredWorkers} onRowsChange={(rows) => { setWorkers(rows); setFilteredWorkers(rows); }} errorCells={errorCells} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="flex justify-between mb-4">
                <FileUploader onFileUpload={(file) => handleFileUpload(file, "tasks")} />
                <SearchBar onSearch={(query) => handleSearch(query, "tasks")} />
              </div>
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsTasks} rows={filteredTasks} onRowsChange={(rows) => { setTasks(rows); setFilteredTasks(rows); }} errorCells={errorCells} />}
            </CardContent>
          </Card>
        </div>
        <aside className="w-1/3 space-y-4">
          <Card className="overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <Tabs defaultValue="core">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="core">Core Errors</TabsTrigger>
                  <TabsTrigger value="ai">AI Detected Errors</TabsTrigger>
                </TabsList>
                <TabsContent value="core">
                  {errors.length > 0 ? (
                    <ul className="text-red-500">
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No validation errors.</p>
                  )}
                </TabsContent>
                <TabsContent value="ai">
                  {aiErrors.length > 0 ? (
                    <ul className="text-yellow-500">
                      {aiErrors.map((error, i) => {
                        if (typeof error === 'string') {
                          return <li key={i}>{error}</li>;
                        }
                        const id = error.ClientID || error.WorkerID || error.TaskID;
                        const message = error.error;
                        if (id) {
                          return <li key={i}>{`ID ${id}: ${message}`}</li>;
                        }
                        return <li key={i}>{message}</li>;
                      })}
                    </ul>
                  ) : (
                    <p>No AI detected errors.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <div className="p-4 border-t">
              <Button onClick={handleAiValidation} className="w-full" disabled={loading}>
                {loading ? "Analyzing..." : "Run AI Validation"}
              </Button>
              <Button onClick={handleAiFix} className="w-full mt-2" disabled={loading}>
                {loading ? "Fixing..." : "Fix with AI"}
              </Button>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <div className="space-y-4">
                <RuleEditor onRuleAdd={handleRuleAdd} />
                <NaturalLanguageRuler onRuleAdd={handleRuleAdd} />
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <pre className="mt-4">{JSON.stringify(rule, null, 2)}</pre>
                    <Button onClick={() => handleRuleRemove(i)} variant="destructive">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Prioritization</CardTitle>
              <CardDescription>
                Set the relative importance of different criteria for the downstream resource allocator.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <PrioritizationEditor onWeightsChange={handleWeightsChange} />
              <pre className="mt-4">{JSON.stringify(weights, null, 2)}</pre>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}