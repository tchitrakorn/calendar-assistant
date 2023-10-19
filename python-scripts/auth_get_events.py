import subprocess


def run_script(script_path):
    completed_process = subprocess.run(['python3', script_path], text=True, capture_output=True)
    
    # Check if the script ran successfully
    if completed_process.returncode != 0:
        raise Exception(f"Script {script_path} encountered an error: {completed_process.stderr}")

    return completed_process.stdout.strip()  # Return the script output
    
# run_script('auth.py')
# run_script('get_events.py')

run_script('./python-scripts/auth.py')
final_result = run_script('get_events.py')
print(final_result)  # This output can be captured by PythonShell