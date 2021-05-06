import pandas as pd
import json
pd.options.display.max_rows = 999

#Create new_countries.json
countries = open('../frontend/public/unep-gpml.topo.json')
countries = json.loads(countries.read())

countries = [x['properties'] for x in countries['objects']['Country_Polygon']['geometries']]
countries = pd.DataFrame(countries)

countries = countries.rename(columns={'M49Code':'id','ISO3CD':'iso_code','ROMNAM':'name', 'MAP_LABEL':'label', 'MAP_COLOR':'territory','STATUS':'description'})
countries = countries[['id','iso_code','name', 'label', 'territory','description']]
countries['member'] = countries['description'].apply(lambda x: 1 if x == 'Member State' else 2)

## FILTER WHERE ISOCODE IS NOT NULL (remove lake value)
countries = countries[countries['iso_code'].notna()]

## DROP DUPLICATE
countries = countries.sort_values(['member','iso_code']).drop_duplicates(subset=['iso_code', 'name'], keep='first')
countries = countries.drop(columns=['member'])

## FILTER VALUE WHERE ID IS NOT NULL
countries = countries[countries['id'].notnull()]

## FILTER VALUE WHERE NAME IS NOT NULL
countries = countries[countries['name'].notnull()]

## CHANGE ID TO INT
countries['id'] = countries['id'].astype(int)
countries = countries.sort_values('id').reset_index(drop=True)

countries.drop(columns=['label']).to_json('../backend/dev/resources/files/new_countries.json', orient='records', indent=2)
print("File new_countries.json created!")


#Map countries old id into new id {old : new}
old = open('../backend/dev/resources/files/countries.json')
old = json.loads(old.read())
old = pd.DataFrame(old)

old = old.sort_values('iso_code')
countries = countries.sort_values('iso_code')

countries['label'] = countries.label.fillna(" ")

mapping = {};
def mappingId(df):
    oldData = old[
        ((old['iso_code'] == df['iso_code']) & (old['name'].str.contains(df['name']))) |
        ((old['iso_code'] == df['iso_code']) & (old['name'] == df['label']))
    ]
    oldId = oldData['id'].values
    if len(oldId) > 0:
        mapping.update({str(oldId[0]): df['id']})
        return "{0}, {1}".format(oldId[0], df['id'])
    mapping.update({str(df['id']): df['id']})
    return "{0}, {1}".format(df['id'], df['id'])

countries['mapping'] = countries.apply(mappingId, axis=1)

with open('../backend/dev/resources/files/new_countries_mapping.json', 'w') as outfile:
    json.dump(mapping, outfile)
print("File new_countries_mapping.json created!")

print("Done")