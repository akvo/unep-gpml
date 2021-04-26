INITIATIVE_FORM='initiative-form-v1.json'
jq -r '.properties | [paths | join(".")]' "$INITIATIVE_FORM" \
    | awk '!/depend|enum|title|type|string|items|add|required|uniqueItems|ref|\[|\]/' \
    | grep '_' \
    | sed 's/^.*_\([^_]*\)$/\1/' \
    | awk '!/properties|G|S/' \
    | sed "s/\./\\_/g" \
    | sed "s/\"//g" \
    | sed 's/^/\q/' \
    | sed 's/\,/\ jsonb\,/g'
