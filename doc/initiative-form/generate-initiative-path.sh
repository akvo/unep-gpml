INITIATIVE_FORM='initiative-form-v1.json'
jq -r 'paths as $path
    | getpath($path) as $v
    | select($path[-1] == "title")
    | {
    "section": $path[1],
    "group": $path[3],
    "number": ("q" + ($v | split(" ")[0])),
    "text": $v
}' ${INITIATIVE_FORM} \
    | jq -s
