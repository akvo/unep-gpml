import json

country_json = open('./doc/CountryLineBoundaries.geojson')
country_json = json.loads(country_json.read())

new_features = []
for x in country_json['features']:
    if not "Continuous line" in x['properties']['Type']:
        new_features.append(x)
    # Including Egypt-Sudan Continuous line boundaries
    if "Continuous line" in x['properties']['Type'] and x['properties']['ISO3CD'] == "EGY_SDN":
        new_features.append(x)

country_json['features'] = new_features

with open('./frontend/public/new_country_line_boundaries.geojson', 'w') as outfile:
    json.dump(country_json, outfile)

print("Done")
