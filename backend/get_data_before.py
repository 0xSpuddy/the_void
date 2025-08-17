#!/usr/bin/env python3
"""
Query data from TheVoidUnsafe oracle contract using getDataBefore function.
This script works with the TheVoidUnsafe contract deployed on Sepolia testnet.
"""

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime
from web3 import Web3
from web3.exceptions import ContractLogicError

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not found. Install with: pip install python-dotenv")
    print("Falling back to environment variables only.")

CONTRACT_ADDRESS = os.getenv("THE_VOID_CONTRACT_ADDR", "0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7")
# Use absolute path relative to script location for robustness
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ABI_FILE = os.path.join(SCRIPT_DIR, "..", "artifacts", "contracts", "TheVoidUnsafe.sol", "TheVoidUnsafe.json")

def load_abi():
    """Load the TheVoidUnsafe contract ABI from the Hardhat artifact JSON file."""
    try:
        with open(ABI_FILE, 'r') as f:
            artifact = json.load(f)
            # Extract ABI from the artifact file
            return artifact['abi']
    except FileNotFoundError:
        print(f"Error: {ABI_FILE} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {ABI_FILE}")
        sys.exit(1)
    except KeyError:
        print(f"Error: 'abi' key not found in {ABI_FILE}")
        sys.exit(1)

def get_data_before(contract, query_id_bytes, timestamp):
    """Query contract for data before specified timestamp."""
    try:
        result = contract.functions.getDataBefore(query_id_bytes, timestamp).call()
        if_retrieve, value, timestamp_retrieved = result
        
        data = {
            'if_retrieve': if_retrieve,
            'value_hex': value.hex() if value else '',
            'value_length': len(value) if value else 0,
            'timestamp_retrieved': timestamp_retrieved,
            'value_uint256': None
        }
        
        # Try to decode as uint256 if 32 bytes
        if value and len(value) == 32:
            try:
                uint_value = int.from_bytes(value, byteorder='big')
                data['value_uint256'] = uint_value / (10**18)
            except:
                pass
        
        return data
    except ContractLogicError as e:
        print(f"Contract call failed: {e}")
        return None
    except Exception as e:
        print(f"Error calling contract: {e}")
        return None

def collect_all_reports(contract, query_id_bytes, query_id, start_timestamp):
    """Collect all reports going back in time from start timestamp."""
    reports = []
    current_timestamp = start_timestamp
    
    print(f"Starting collection from timestamp: {current_timestamp}")
    print("Collecting reports... (Press Ctrl+C to stop)")
    
    try:
        while True:
            data = get_data_before(contract, query_id_bytes, current_timestamp)
            
            if not data or not data['if_retrieve']:
                print(f"No more data found at timestamp {current_timestamp}")
                break
            
            # Add metadata
            data['query_id'] = query_id
            data['requested_timestamp'] = current_timestamp
            data['datetime'] = datetime.fromtimestamp(data['timestamp_retrieved']).isoformat()
            
            reports.append(data)
            
            print(f"Found report {len(reports)}: timestamp {data['timestamp_retrieved']}, value {data['value_uint256']}")
            
            # Move back in time (retrieved timestamp - 1 second)
            current_timestamp = data['timestamp_retrieved'] - 1
            
            # Small delay to avoid overwhelming the RPC
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print(f"\nStopped by user. Collected {len(reports)} reports.")
    
    return reports

def save_to_csv(reports, filename):
    """Save reports to CSV file."""
    if not reports:
        print("No reports to save.")
        return
    
    fieldnames = ['query_id', 'requested_timestamp', 'timestamp_retrieved', 'datetime', 
                  'if_retrieve', 'value_hex', 'value_length', 'value_uint256']
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(reports)
    
    print(f"Saved {len(reports)} reports to {filename}")

def main():
    parser = argparse.ArgumentParser(description='Query TheVoidUnsafe oracle data')
    parser.add_argument('--all-reports', action='store_true', 
                       help='Collect all reports going back in time and save to CSV')
    parser.add_argument('timestamp', nargs='?', type=int,
                       help='Timestamp to query (required if not using --all-reports)')
    parser.add_argument('--output', '-o', default='oracle_reports.csv',
                       help='Output CSV filename (default: oracle_reports.csv)')
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.all_reports and args.timestamp is None:
        parser.error('Either provide a timestamp or use --all-reports flag')
    
    # Get RPC URL and Query ID from environment variables
    rpc_url = os.getenv('SEPOLIA_RPC_URL')
    query_id = os.getenv('QUERY_ID')
    
    if not rpc_url:
        print("Error: SEPOLIA_RPC_URL not found in environment variables or .env file")
        sys.exit(1)
    
    if not query_id:
        print("Error: QUERY_ID not found in environment variables or .env file")
        sys.exit(1)
    
    # Convert query_id to bytes32 if it's a hex string
    if query_id.startswith('0x'):
        query_id_bytes = bytes.fromhex(query_id[2:])
    else:
        query_id_bytes = bytes.fromhex(query_id)
    
    # Initialize Web3
    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            print("Error: Could not connect to RPC endpoint")
            sys.exit(1)
    except Exception as e:
        print(f"Error connecting to RPC: {e}")
        sys.exit(1)
    
    # Load ABI and create contract instance
    abi = load_abi()
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
    
    if args.all_reports:
        # Use current timestamp if none provided
        start_timestamp = args.timestamp if args.timestamp else int(time.time())
        reports = collect_all_reports(contract, query_id_bytes, query_id, start_timestamp)
        save_to_csv(reports, args.output)
    else:
        # Single query mode
        data = get_data_before(contract, query_id_bytes, args.timestamp)
        
        if data:
            print(f"Query ID: {query_id}")
            print(f"Requested Timestamp: {args.timestamp}")
            print(f"Data Found: {data['if_retrieve']}")
            print(f"Retrieved Timestamp: {data['timestamp_retrieved']}")
            print(f"Value (hex): {data['value_hex']}")
            print(f"Value length: {data['value_length']} bytes")
            if data['value_uint256'] is not None:
                print(f"Value as uint256: {data['value_uint256']}")

if __name__ == "__main__":
    main()