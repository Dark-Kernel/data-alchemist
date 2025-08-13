"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Weight } from "@/lib/types";

interface PrioritizationEditorProps {
  onWeightsChange: (weights: Weight) => void;
}

const presetProfiles = {
  balanced: { priorityLevel: 50, fulfillment: 50, fairness: 50 },
  maximizeFulfillment: { priorityLevel: 20, fulfillment: 100, fairness: 20 },
  fairDistribution: { priorityLevel: 20, fulfillment: 20, fairness: 100 },
};

export function PrioritizationEditor({ onWeightsChange }: PrioritizationEditorProps) {
  const [priorityLevel, setPriorityLevel] = useState(50);
  const [fulfillment, setFulfillment] = useState(50);
  const [fairness, setFairness] = useState(50);

  useEffect(() => {
    onWeightsChange({
      priorityLevel: priorityLevel / 100,
      fulfillment: fulfillment / 100,
      fairness: fairness / 100,
    });
  }, [priorityLevel, fulfillment, fairness, onWeightsChange]);

  const applyProfile = (profile: keyof typeof presetProfiles) => {
    const { priorityLevel, fulfillment, fairness } = presetProfiles[profile];
    setPriorityLevel(priorityLevel);
    setFulfillment(fulfillment);
    setFairness(fairness);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between space-x-2">
        <Button variant="outline" onClick={() => applyProfile("balanced")}>
          Balanced
        </Button>
        <Button variant="outline" onClick={() => applyProfile("maximizeFulfillment")}>
          Max Fulfillment
        </Button>
        <Button variant="outline" onClick={() => applyProfile("fairDistribution")}>
          Fair Distribution
        </Button>
      </div>
      <div>
        <Label>Priority Level</Label>
        <Slider
          value={[priorityLevel]}
          onValueChange={(value) => setPriorityLevel(value[0])}
        />
      </div>
      <div>
        <Label>Fulfillment</Label>
        <Slider
          value={[fulfillment]}
          onValueChange={(value) => setFulfillment(value[0])}
        />
      </div>
      <div>
        <Label>Fairness</Label>
        <Slider
          value={[fairness]}
          onValueChange={(value) => setFairness(value[0])}
        />
      </div>
    </div>
  );
}
