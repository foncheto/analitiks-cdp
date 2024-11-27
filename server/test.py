import pandas as pd

# Load the CSV file
file_path = "/Users/foncho/Downloads/Deals_27-11-2024_1033.csv"  # Replace with your actual file path
df = pd.read_csv(file_path)

# Remove quotes from column headers
df.columns = [col.replace('"', '') for col in df.columns]

# fill na with 0
df.fillna(0, inplace=True)


df = df.head(10)
# Save the updated CSV
output_path = "output_file.csv"  # Replace with your desired output file path
df.to_csv(output_path, index=False)

print("Quotations removed from headers and file saved.")
