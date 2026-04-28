import json

EVAL_FILE = "evaluation/ground_truth_bench.jsonl"

def generate_handcrafted_eval_set():
    print("Neural Data Factory: Generating Gold Standard Scenarios (Local Fallback)...")
    
    scenarios = [
        {
            "raw_feedback": "The checkout button is completely missing on Safari mobile. Our cart abandonment is skyrocketing today! We process $50k/day on mobile.",
            "ideal_triage": {
                "title": "Missing Checkout Button on Safari Mobile",
                "severity": "Critical",
                "mrr_risk": 50000,
                "intent": "Bug",
                "reasoning": "Core conversion flow is completely blocked on a major platform with direct revenue impact stated."
            }
        },
        {
            "raw_feedback": "I can't seem to find the dark mode toggle. Can you add one? The white screen hurts my eyes at night.",
            "ideal_triage": {
                "title": "Feature Request: Dark Mode Toggle",
                "severity": "Low",
                "mrr_risk": 0,
                "intent": "Feature Request",
                "reasoning": "Aesthetic preference with no direct revenue or operational blocker."
            }
        },
        {
            "raw_feedback": "The analytics API endpoint /v2/stats is returning 500 internal server errors intermittently for the past hour. Affects our reporting dashboard.",
            "ideal_triage": {
                "title": "Intermittent 500 Errors on /v2/stats API",
                "severity": "High",
                "mrr_risk": 5000,
                "intent": "Bug",
                "reasoning": "Degraded performance on a core API endpoint. Not a complete outage but affects enterprise reporting."
            }
        },
        {
            "raw_feedback": "I was charged twice for my pro subscription this month. Please refund the extra charge immediately.",
            "ideal_triage": {
                "title": "Double Charge on Pro Subscription",
                "severity": "High",
                "mrr_risk": 50,
                "intent": "Support / Billing",
                "reasoning": "Critical billing issue requiring immediate support intervention to prevent churn and chargebacks."
            }
        },
        {
            "raw_feedback": "The new dashboard looks weird on my iPad. The graphs overlap the sidebar slightly.",
            "ideal_triage": {
                "title": "UI Overlap on iPad Dashboard",
                "severity": "Medium",
                "mrr_risk": 0,
                "intent": "Bug",
                "reasoning": "Visual glitch on a specific device that degrades experience but doesn't block core functionality."
            }
        }
    ]
    
    with open(EVAL_FILE, 'w', encoding='utf-8') as f:
        for s in scenarios:
            f.write(json.dumps(s) + "\n")
            
    print(f"Success! Generated {len(scenarios)} handcrafted scenarios at: {EVAL_FILE}")

if __name__ == "__main__":
    generate_handcrafted_eval_set()
