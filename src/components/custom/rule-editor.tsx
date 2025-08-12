"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Rule } from "@/lib/types";

interface RuleEditorProps {
  onRuleAdd: (rule: Rule) => void;
}

export function RuleEditor({ onRuleAdd }: RuleEditorProps) {
  const [ruleType, setRuleType] = useState<"coRun" | "slotRestriction" | "loadLimit" | "">("");
  const [taskIds, setTaskIds] = useState("");
  const [group, setGroup] = useState("");
  const [minSlots, setMinSlots] = useState("");
  const [maxSlots, setMaxSlots] = useState("");

  const handleSave = () => {
    let rule: Rule;
    switch (ruleType) {
      case "coRun":
        rule = { type: "coRun", tasks: taskIds.split(",").map(s => s.trim()) };
        break;
      case "slotRestriction":
        rule = { type: "slotRestriction", group, minCommonSlots: parseInt(minSlots) };
        break;
      case "loadLimit":
        rule = { type: "loadLimit", group, maxSlotsPerPhase: parseInt(maxSlots) };
        break;
      default:
        return;
    }
    onRuleAdd(rule);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Rule</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Business Rule</DialogTitle>
          <DialogDescription>
            Create a new business rule to apply to your data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-type" className="text-right">
              Rule Type
            </Label>
            <Select onValueChange={(value: "coRun" | "slotRestriction" | "loadLimit") => setRuleType(value)}>
              <SelectTrigger id="rule-type" className="col-span-3">
                <SelectValue placeholder="Select a rule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coRun">Co-run</SelectItem>
                <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
                <SelectItem value="loadLimit">Load Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {ruleType === "coRun" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-ids" className="text-right">
                Task IDs
              </Label>
              <Input
                id="task-ids"
                className="col-span-3"
                value={taskIds}
                onChange={(e) => setTaskIds(e.target.value)}
                placeholder="e.g., T1, T2, T3"
              />
            </div>
          )}
          {ruleType === "slotRestriction" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <Input
                  id="group"
                  className="col-span-3"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="e.g., ClientGroupA"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min-slots" className="text-right">
                  Min Common Slots
                </Label>
                <Input
                  id="min-slots"
                  type="number"
                  className="col-span-3"
                  value={minSlots}
                  onChange={(e) => setMinSlots(e.target.value)}
                />
              </div>
            </>
          )}
          {ruleType === "loadLimit" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <Input
                  id="group"
                  className="col-span-3"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="e.g., WorkerGroupA"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max-slots" className="text-right">
                  Max Slots Per Phase
                </Label>
                <Input
                  id="max-slots"
                  type="number"
                  className="col-span-3"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
