"""Text Query Example for Shout"""

from web3 import Web3
import hashlib

# Original strings
query = "What is the meaning of life?"
value = "milady"

# Initialize Web3 (no need for connection for encoding)
w3 = Web3()

def generate_string_query_data(text):
    """
    Generate StringQuery query data according to Tellor spec:
    abi.encode("StringQuery", abi.encode(text))
    """
    # First, ABI encode the text parameter
    query_data_args = w3.codec.encode(['string'], [text])
    print("query_data_args (encoded text):", "0x" + query_data_args.hex())
    
    # Then, ABI encode "StringQuery" with the encoded arguments
    query_data = w3.codec.encode(['string', 'bytes'], ["StringQuery", query_data_args])
    print("query_data (full):", "0x" + query_data.hex())
    
    return query_data.hex()

def generate_query_id(query_data_bytes):
    """
    Generate query_id using keccak256 hash of query_data.
    """
    # Calculate keccak256 hash
    query_id = w3.keccak(query_data_bytes)
    return query_id.hex()

def encode_response_value(text):
    """
    ABI encode a string response value.
    """
    # ABI encode the string
    encoded = w3.codec.encode(['string'], [text])
    return encoded.hex()

# Generate the encoded data
print("Original query:", query)
print("Original value:", value)
print()

# Generate query_data according to StringQuery format
query_data_hex = generate_string_query_data(query)

# Convert hex back to bytes for query_id generation
query_data_bytes = bytes.fromhex(query_data_hex)

# Generate query_id using keccak256 hash
query_id_hex = generate_query_id(query_data_bytes)

# Generate value (ABI encoded response value)
encoded_value_hex = encode_response_value(value)

print()
print("=== JAVASCRIPT CODE FOR SHOUT ===")
print("// Use these values with the 'shout' function (NOT submitValue)")
print("const queryData =", f'"0x{query_data_hex}";')
print("const queryId =", f'"0x{query_id_hex}";')
print("const value =", f'"0x{encoded_value_hex}";')
print("const nonce = 0; // or appropriate nonce value")
print()
print("// Call the shout function:")
print("await contract.shout(queryId, value, nonce, queryData);")
print()

print("=== STANDARDIZED VALUES (use these for all shouts) ===")
print("query_data:", "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000")
print("query_id:", "0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89")
print()
print("IMPORTANT: Use 'shout' function, not 'submitValue'!")
