"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/custom/file-uploader";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { DataGrid } from "@/components/custom/data-grid";
import {
  validateMissingColumns,
  validateDuplicateIds,
  validateOutOfRange,
  validateMalformedLists,
  validateBrokenJson,
} from "@/lib/validators";
import { SearchBar } from "@/components/custom/search-bar";
import { RuleEditor } from "@/components/custom/rule-editor";
import { NaturalLanguageRuler } from "@/components/custom/natural-language-ruler";
import { PrioritizationEditor } from "@/components/custom/prioritization-editor";
import { saveAs } from "file-saver";
import { Client, Worker, Task, Rule, Weight, AiError } from "@/lib/types";

const columnsClients = [
  { key: "ClientID", name: "Client ID", editor: true },
  { key: "ClientName", name: "Client Name", editor: true },
  { key: "PriorityLevel", name: "Priority Level", editor: true },
  { key: "RequestedTaskIDs", name: "Requested Task IDs", editor: true },
  { key: "GroupTag", name: "Group Tag", editor: true },
  { key: "AttributesJSON", name: "Attributes JSON", editor: true },
];

const columnsWorkers = [
  { key: "WorkerID", name: "Worker ID", editor: true },
  { key: "WorkerName", name: "Worker Name", editor: true },
  { key: "Skills", name: "Skills", editor: true },
  { key: "AvailableSlots", name: "Available Slots", editor: true },
  { key: "MaxLoadPerPhase", name: "Max Load Per Phase", editor: true },
  { key: "WorkerGroup", name: "Worker Group", editor: true },
  { key: "QualificationLevel", name: "Qualification Level", editor: true },
];

const columnsTasks = [
  { key: "TaskID", name: "Task ID", editor: true },
  { key: "TaskName", name: "Task Name", editor: true },
  { key: "Category", name: "Category", editor: true },
  { key: "Duration", name: "Duration", editor: true },
  { key: "RequiredSkills", name: "Required Skills", editor: true },
  { key: "PreferredPhases", name: "Preferred Phases", editor: true },
  { key: "MaxConcurrent", name: "Max Concurrent", editor: true },
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

  const handleWeightsChange = (newWeights: Weight) => {
    setWeights(newWeights);
  };

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

  useEffect(() => {
    const allErrors: string[] = [];
    if(clients.length > 0) {
      allErrors.push(...validateMissingColumns(clients, columnsClients.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(clients, "ClientID"));
      allErrors.push(...validateOutOfRange(clients, "PriorityLevel", 1, 5));
      allErrors.push(...validateBrokenJson(clients, "AttributesJSON"));
    }
    if(workers.length > 0) {
      allErrors.push(...validateMissingColumns(workers, columnsWorkers.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(workers, "WorkerID"));
      allErrors.push(...validateMalformedLists(workers, "AvailableSlots"));
    }
    if(tasks.length > 0) {
      allErrors.push(...validateMissingColumns(tasks, columnsTasks.map(c => c.key)));
      allErrors.push(...validateDuplicateIds(tasks, "TaskID"));
      allErrors.push(...validateOutOfRange(tasks, "Duration", 1, Infinity));
    }

    setErrors(allErrors);
  }, [clients, workers, tasks]);

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
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsClients} rows={filteredClients} onRowsChange={setClients} />}
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
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsWorkers} rows={filteredWorkers} onRowsChange={setWorkers} />}
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
              {loading ? <p>Loading...</p> : <DataGrid columns={columnsTasks} rows={filteredTasks} onRowsChange={setTasks} />}
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
                <pre className="mt-4">{JSON.stringify(rules, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Prioritization</CardTitle>
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
