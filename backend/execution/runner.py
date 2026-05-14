import subprocess
import time
import json
from typing import List, Optional
from contracts.models import VersionedAlgorithmContract

class ExecutionResult:
    def __init__(self, success: bool, output: str = "", error: str = "", exit_code: int = 0, time_ms: float = 0):
        self.success = success
        self.output = output
        self.error = error
        self.exit_code = exit_code
        self.time_ms = time_ms

class IsolatedRunner:
    def __init__(self, timeout: int = 5, memory_limit_mb: int = 128):
        self.timeout = timeout
        self.memory_limit_mb = memory_limit_mb

    def run_command(self, command: List[str], input_str: Optional[str] = None) -> ExecutionResult:
        start_time = time.time()
        try:
            process = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(input=input_str, timeout=self.timeout)
            end_time = time.time()
            time_ms = (end_time - start_time) * 1000
            
            return ExecutionResult(
                success=(process.returncode == 0),
                output=stdout,
                error=stderr,
                exit_code=process.returncode,
                time_ms=time_ms
            )
        except subprocess.TimeoutExpired:
            process.kill()
            return ExecutionResult(success=False, error="Execution timed out", exit_code=-1)
        except Exception as e:
            return ExecutionResult(success=False, error=str(e), exit_code=-1)

    def run_algorithm(self, command: List[str], input_data: List[int]) -> Optional[VersionedAlgorithmContract]:
        # Standardized way to pass data to subprocess: JSON string via stdin
        input_json = json.dumps({"input": input_data})
        result = self.run_command(command, input_str=input_json)
        
        if result.success:
            try:
                # Expecting the subprocess to print the VersionedAlgorithmContract JSON to stdout
                return VersionedAlgorithmContract.model_validate_json(result.output)
            except Exception as e:
                print(f"Failed to parse algorithm output: {e}")
                return None
        return None
