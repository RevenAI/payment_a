#!/usr/bin/env bash

# ------------------------------------------
# generate-tree.sh
# Pure Bash project tree generator
# ------------------------------------------

OUTPUT_FILE="PROJECT_TREE.txt"
IGNORE_DIRS=("node_modules" ".git" "dist" "build")

# Move safely to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Clear output file
: > "$OUTPUT_FILE"

# ------------------------------------------
# Helper: check if dir should be ignored
# ------------------------------------------
should_ignore() {
  local dir="$1"
  for ignore in "${IGNORE_DIRS[@]}"; do
    [[ "$dir" == "$ignore" ]] && return 0
  done
  return 1
}

# ------------------------------------------
# Recursive tree printer
# ------------------------------------------
print_tree() {
  local dir="$1"
  local prefix="$2"

  local items=()
  for item in "$dir"/*; do
    [[ -e "$item" ]] || continue
    local name="$(basename "$item")"
    should_ignore "$name" && continue
    items+=("$item")
  done

  local count=${#items[@]}
  local index=0

  for item in "${items[@]}"; do
    index=$((index + 1))
    local name="$(basename "$item")"

    if [[ $index -eq $count ]]; then
      echo "${prefix}└── $name" >> "$OUTPUT_FILE"
      [[ -d "$item" ]] && print_tree "$item" "${prefix}    "
    else
      echo "${prefix}├── $name" >> "$OUTPUT_FILE"
      [[ -d "$item" ]] && print_tree "$item" "${prefix}│   "
    fi
  done
}

# ------------------------------------------
# Start tree
# ------------------------------------------
echo "$(basename "$PROJECT_ROOT")" >> "$OUTPUT_FILE"
print_tree "$PROJECT_ROOT" ""

echo "Project tree written to $OUTPUT_FILE"
