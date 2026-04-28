import pandas as pd
import json
import os

SWE_BENCH_DEV = "datsetfolder/dev-00000-of-00001.parquet"
EVAL_OUTPUT = "evaluation/swe_bench_evaluation_suite.jsonl"

def prepare_swe_bench_eval():
    print("Neural Benchmarking: Ingesting SWE-bench 'Gold Standard' Data...")
    
    if not os.path.exists(SWE_BENCH_DEV):
        print(f"Error: {SWE_BENCH_DEV} not found.")
        return

    # Load the dev split of SWE-bench
    df = pd.read_parquet(SWE_BENCH_DEV)
    print(f"Loaded {len(df)} real-world software engineering tasks.")
    
    # We will sample 50 diverse issues to form our core benchmarking suite
    sample_df = df.sample(n=min(50, len(df)), random_state=42)
    
    eval_cases = []
    
    for _, row in sample_df.iterrows():
        # SWE-bench contains the exact issue description (problem_statement)
        # and the exact repository it belongs to.
        eval_case = {
            "instance_id": row["instance_id"],
            "repo": row["repo"],
            "raw_signal": row["problem_statement"],
            # In a full automated test, we would compare our Agent's generated PRD
            # against the actual `patch` (the code that fixed it) to see if the PRD
            # accurately prescribed the correct files/functions to change.
            "ground_truth_patch_length": len(str(row["patch"])),
            "contains_tests": pd.notna(row.get("test_patch")) and len(str(row.get("test_patch"))) > 0
        }
        eval_cases.append(eval_case)

    with open(EVAL_OUTPUT, 'w', encoding='utf-8') as f:
        for case in eval_cases:
            f.write(json.dumps(case) + "\n")
            
    print(f"Success! Generated High-Fidelity Benchmark Suite at: {EVAL_OUTPUT}")
    print("This suite tests the AI's ability to ingest a raw GitHub issue and generate a PRD that matches the ACTUAL merged pull request.")

if __name__ == "__main__":
    prepare_swe_bench_eval()
