import pandas as pd
import json
pd.options.display.max_rows = 999

#Create new_countries.json
countries = open('./frontend/public/unep-gpml.topo.json')
countries = json.loads(countries.read())

countries = [x['properties'] for x in countries['objects']['Country_Polygon']['geometries']]
countries = pd.DataFrame(countries)

## Use ROMNAM when MAP_LABEL IS None
def getRomnam(df):
    if df['MAP_LABEL'] is None:
        return df['ROMNAM']
    return df['MAP_LABEL']

countries['MAP_LABEL'] = countries.apply(getRomnam, axis=1)

countries = countries.rename(columns={'M49Code':'id','ISO3CD':'iso_code','ROMNAM':'romnam', 'MAP_LABEL':'name', 'MAP_COLOR':'territory','STATUS':'description'})
countries = countries[['id','iso_code','romnam', 'name', 'territory','description']]
countries['member'] = countries['description'].apply(lambda x: 1 if x == 'Member State' else 2)

## FILTER WHERE ISOCODE IS NOT NULL (remove lake value)
countries = countries[countries['iso_code'].notna()]

## DROP DUPLICATE
countries = countries.sort_values(['member','iso_code']).drop_duplicates(subset=['iso_code', 'name', 'romnam'], keep='first')
countries = countries.drop(columns=['member'])

## FILTER VALUE WHERE ID IS NOT NULL
countries = countries[countries['id'].notnull()]

## FILTER VALUE WHERE NAME IS NOT NULL
countries = countries[countries['name'].notnull()]

## CHANGE ID TO INT
countries['id'] = countries['id'].fillna(0)
countries['id'] = countries['id'].astype(int)

countries = countries.sort_values('id').reset_index(drop=True)
countries.sort_values('id').drop(columns=['romnam']).to_json('./backend/dev/resources/files/new_countries.json', orient='records', indent=2)
print("File new_countries.json created!")


#Map countries old id into new id {old : new}
old = open('./backend/dev/resources/files/countries.json')
old = json.loads(old.read())
old = pd.DataFrame(old)

old = old.sort_values('iso_code')
countries = countries.sort_values('iso_code')

countries['name'] = countries['name'].fillna(" ")

mapping = {};
def mappingId(df):
    new_name = df['name']
    if new_name is None:
        new_name = ""
    if "*" in new_name:
        new_name = new_name.split(" *")[0]
    if "North" in new_name:
        new_name = new_name.split("North ")
        new_name = new_name[0]
        if len(new_name) > 0:
            new_name = new_name[1]
    if "Canary" in new_name:
        new_name = new_name.split(" ")[0]
    if "," in new_name:
        new_name = new_name.split(", ")[0]
    if new_name == 'Heard Is. & McDonald Is. (Aust.)':
        new_name = 'Heard Isl. & McDonald Is. (Aust.)'
    if new_name == 'Norfolk Island (Aust.)':
        new_name = 'Norfolk Is. (Aust.)'
    if new_name == 'Azores Islands (Port.)':
        new_name = 'Azores Is. (Port.)'
    if new_name == 'Clipperton Island':
        new_name = 'Clipperton Is. (Fr.)'
    if new_name == 'Jarvis Island (USA)':
        new_name = 'Jarvis Is. (USA)'
    if new_name == 'Howland Island (USA)':
        new_name = 'Howland Is. (USA)'
    if new_name == 'Tajikistan':
        new_name = 'Tadjikistan'
    # should be null name on old countries
    if new_name in ['Aksai Chin', 'Arunachal Pradesh', 'Paracel Islands', 'Spratly Islands', 'Senkaku Islands', 'Scarborough Reef', 'China/India']:
        new_name = ""

    if df['name'] == 'Chagos Archipelago (Mauritius)':
        df['name'] = 'Chagos Archipelagio **'

    oldData = old[
        ((old['iso_code'] == df['iso_code']) & (old['name'].str.contains(new_name)))
        | ((old['iso_code'] == df['iso_code']) & (old['name'] == new_name))
        | ((old['iso_code'] == df['iso_code']) & (old['name'] == df['name']))
        | ((old['iso_code'] == df['iso_code']) & (old['name'] == df['romnam']))
        | (old['name'] == df['name'])
    ]

    oldId = oldData['id'].values
    if len(oldId) > 0:
        mapping.update({str(oldId[0]): df['id']})
        return "{0}, {1}".format(oldId[0], df['id'])
    mapping.update({str(df['id']): df['id']})
    return "{0}, {1}".format(df['id'], df['id'])

countries['mapping'] = countries.apply(mappingId, axis=1)

with open('./backend/dev/resources/files/new_countries_mapping.json', 'w') as outfile:
    json.dump(mapping, outfile)
print("File new_countries_mapping.json created!")

print("Done")