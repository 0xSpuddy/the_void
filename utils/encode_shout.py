"""Text Query Example for Shout"""

from web3 import Web3
import hashlib

# Original strings
query = "What is the meaning of life?"
value = "milady"

# Initialize Web3 (no need for connection for encoding)
w3 = Web3()

def encode_string_to_hex(text):
    """
    ABI encode a string and convert to Ethereum compatible hex.
    """
    # ABI encode the string
    encoded = w3.codec.encode(['string'], [text])
    # Convert to hex string with 0x prefix
    return encoded.hex()

def generate_query_id(query_data_hex):
    """
    Generate query_id by ABI encoding the query_data hex string.
    """
    # Remove 0x prefix if present
    if query_data_hex.startswith('0x'):
        query_data_hex = query_data_hex[2:]
    
    # Convert hex string to bytes
    query_data_bytes = bytes.fromhex(query_data_hex)
    
    # ABI encode the bytes
    encoded = w3.codec.encode(['bytes'], [query_data_bytes])
    return encoded.hex()

# Generate the encoded data
print("Original query:", query)
print("Original value:", value)
print()

# Generate query_data (ABI encoded query string)
query_data = encode_string_to_hex(query)
print("query_data (hex):", "0x" + query_data)

# Generate query_id (ABI encoded query_data)
query_id = generate_query_id(query_data)
print("query_id (hex):", "0x" + query_id)

# Generate value (ABI encoded value string)
encoded_value = encode_string_to_hex(value)
print("value (hex):", "0x" + encoded_value)

print()
print("Summary:")
print(f"query_data = '0x{query_data}'")
print(f"query_id = '0x{query_id}'")
print(f"value = '0x{encoded_value}'")
