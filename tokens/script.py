import json


def combine_token_data(chain_ids, output_file="unique_tokens.json"):
    combined_data = {}

    # Loop through chain IDs and read the corresponding files
    for chain_id in chain_ids:
        file_name = f"{chain_id}_tokens.json"
        try:
            with open(file_name, "r") as file:
                token_list = json.load(file)

            # Process each token in the file
            for address, token_info in token_list.items():
                # print(address, token_info)
                symbol = token_info["symbol"]
                chain_id_str = str(token_info["chainId"])

                # Initialize the structure for this symbol if not already done
                if symbol not in combined_data:
                    combined_data[symbol] = {
                        "addresses": {},
                        "name": token_info["name"],
                        "coinKey": token_info.get("coinKey", None),
                        "logo": token_info.get(
                            "logo", None
                        ),  # Default to null if logo is missing
                        "balance": "0",
                        "symbol": symbol,
                    }

                # Add or update the chain-specific address and decimals
                if chain_id_str not in combined_data[symbol]["addresses"]:
                    combined_data[symbol]["addresses"][chain_id_str] = {
                        "address": address,
                        "decimals": token_info["decimals"],
                        "balance": "0",
                    }

        except FileNotFoundError:
            print(f"Warning: File {file_name} not found. Skipping...")
        except json.JSONDecodeError:
            print(f"Error: File {file_name} contains invalid JSON. Skipping...")

    # Write the combined data to the output file
    with open(output_file, "w") as outfile:
        json.dump(combined_data, outfile, indent=4)
    print(f"Combined data written to {output_file}")


# Example usage
chain_ids = [
    1,
    42161,
    534352,
    137,
    5000,
    10,
    100,
    8453
]  # Replace with the chain IDs you want to process
combine_token_data(chain_ids)
