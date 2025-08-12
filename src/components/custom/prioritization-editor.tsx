"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Weight } from "@/lib/types";

interface PrioritizationEditorProps {
  onWeightsChange: (weights: Weight) => void;
}

export function PrioritizationEditor({ onWeightsChange }: PrioritizationEditorProps) {
  const [priorityLevel, setPriorityLevel] = useState(50);
  const [fulfillment, setFulfillment] = useState(50);
  const [fairness, setFairness] = useState(50);

  const handleWeightsChange = () => {
    onWeightsChange({
      priorityLevel: priorityLevel / 100,
      fulfillment: fulfillment / 100,
      fairness: fairness / 100,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Priority Level</Label>
        <Slider
          value={[priorityLevel]}
          onValueChange={(value) => setPriorityLevel(value[0])}
          onMouseUp={handleWeightsChange}
        />
      </div>
      <div>
        <Label>Fulfillment</Label>
        <Slider
          value={[fulfillment]}
          onValueChange={(value) => setFulfillment(value[0])}
          onMouseUp={handleWeightsChange}
        />
      </div>
      <div>
        <Label>Fairness</Label>
        <Slider
          value={[fairness]}
          onValueChange={(value) => setFairness(value[0])}
          onMouseUp={handleWeightsChange}
        />
      </div>
    </div>
  );
}
