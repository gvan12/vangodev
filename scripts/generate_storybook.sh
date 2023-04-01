#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <filepath>"
  exit 1
fi

file_path="$1"
file_name="$(basename "$file_path")"
file_ext="${file_name##*.}"
file_base_name="${file_name%.*}"
stories_file_name="${file_base_name}.stories.${file_ext}"
dir_path="$(dirname "$file_path")"
stories_file_path="${dir_path}/${stories_file_name}"

component_code=$(cat "$file_path" | jq -sR '.')

api_url="http://localhost:3000/api/generate-storybook"

# Escape and format the component_code as JSON string
json_component_code=$(echo "$component_code" | jq -R --slurp '.')

# Call the API
response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"componentCode\": $json_component_code}" "$api_url")


# Debug: Print the response
echo "$response"

# Extract the Storybook code from the response
storybook_code=$(echo "$response" | jq -r ".storybookCode")

# Unescape the Storybook code
unescaped_storybook_code=$(echo "$storybook_code" | jq -r '.')

# Create the new stories file alongside the input file
echo "$unescaped_storybook_code" > "$stories_file_path"

echo "Storybook file created at: $stories_file_path"
