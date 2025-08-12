"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Rule } from "@/lib/types";

interface NaturalLanguageRulerProps {
  onRuleAdd: (rule: Rule) => void;
}

export function NaturalLanguageRuler({ onRuleAdd }: NaturalLanguageRulerProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    setLoading(true);
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_rule", payload: { text } }),
    });
    const rule = await response.json();
    onRuleAdd(rule);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Tasks T1 and T2 always run together."
      />
      <Button onClick={handleParse} disabled={loading}>
        {loading ? "Parsing..." : "Parse Rule"}
      </Button>
    </div>
  );
}