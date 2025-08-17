#!/usr/bin/env python3
"""
Build script for The Void frontend.
This script builds the React frontend and prepares it to be served by FastAPI.
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(cmd, cwd=None, env=None):
    """Run a command and return True if successful."""
    try:
        print(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, cwd=cwd, env=env, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"Command not found: {cmd[0]}")
        return False

def main():
    """Build the frontend."""
    project_root = Path(__file__).parent
    frontend_dir = project_root / "frontend"
    
    if not frontend_dir.exists():
        print("Error: frontend directory not found")
        return False
    
    # Load environment variables from .env file if it exists
    build_env = os.environ.copy()
    env_file = project_root / ".env"
    
    if env_file.exists():
        print("📄 Loading environment variables from .env file...")
        try:
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        # Add VITE_ prefix for frontend environment variables
                        if key == 'THE_VOID_CONTRACT_ADDR':
                            build_env['VITE_THE_VOID_CONTRACT_ADDR'] = value
                            print(f"  Set VITE_THE_VOID_CONTRACT_ADDR={value}")
                        elif key == 'CHAIN_ID':
                            build_env['VITE_CHAIN_ID'] = value
                            print(f"  Set VITE_CHAIN_ID={value}")
        except Exception as e:
            print(f"⚠️  Warning: Could not read .env file: {e}")
    else:
        print("⚠️  No .env file found. Using default values.")
    
    os.chdir(frontend_dir)
    
    # Check if Node.js and npm are available
    if not shutil.which("node"):
        print("Error: Node.js not found. Please install Node.js")
        return False
    
    if not shutil.which("npm"):
        print("Error: npm not found. Please install npm")
        return False
    
    print("Building The Void frontend...")
    print("=" * 50)
    
    # Install dependencies
    print("Installing dependencies...")
    if not run_command(["npm", "install"], cwd=frontend_dir, env=build_env):
        print("Failed to install dependencies")
        return False
    
    # Build the project
    print("Building production bundle...")
    if not run_command(["npm", "run", "build"], cwd=frontend_dir, env=build_env):
        print("Failed to build frontend")
        return False
    
    # Check if dist directory was created
    dist_dir = frontend_dir / "dist"
    if not dist_dir.exists():
        print("Error: dist directory not created")
        return False
    
    print("✅ Frontend built successfully!")
    print(f"📁 Built files are in: {dist_dir}")
    print("🚀 You can now run: python -m the_void.main")
    print("🌐 The app will be available at: http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
