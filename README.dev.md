## Running seeder code as Kubernetes Job

Check the code in [ci/k8s/seeder.yaml] and modify the option you want to execute:

* `set-admin` (this one requires an email address to be approved and set as admin)
* `run-seeder`

See the code at [backend/dev/seeder.clj]

Generate a unique name by using a timestamp prefix in the job name

```bash
export ts="$(date +%s)"
sed "s/\${TIMESTAMP}/${ts}/" ci/k8s/seeder.yaml > "/tmp/seeder-${ts}.yml";
kubectl apply -f "/tmp/seeder-${ts}.yml"
```

## Exporting current state of the database

Run the `dump-db.sh` script:

```bash
./db/script/dump-db.sh
```

This will make the necessary changes in `./db/docker-entrypoint-initdb.d/001-init.sql` file. Commit
and push those changes.


## Merge GeoJSON file

Before Simplifying GeoJSON to TopoJSON file, we need to merge 3 GEOJSON files into single file. For processing that
merged file, we use [GDAL](https://gdal.org/).

Assuming you have access to that 3 files:
* `Countries_Separated_with_associated_territories.geojson`
* `Major Lakes.geojson`
* `Unsettled Territory.geojson`
then move to the folder where you have the files and execute:

```bash
docker run \
    --rm \
    --volume "$(pwd):/data" \
    --workdir /data \
    osgeo/gdal:alpine-small-3.3.0 \
    ogr2ogr merged.geojson Countries_Separated_with_associated_territories.geojson && \
    sudo chown -R "$(whoami)":"$(whoami)" merged.geojson && \
    ogr2ogr -update -append merged.geojson Major\ Lakes.geojson -nln Countries_Separated_with_associated_territories && \
    ogr2ogr -update -append merged.geojson Unsettled\ Territory.geojson -nln Countries_Separated_with_associated_territories && \
    mv merged.geojson Country_Polygon.json
```

We run the `ogr2ogr` command with the proper arguments. This will generate a single merged file (`Country_Polygon.json`).


## Simplifying GeoJSON to TopoJSON

We use a *simplified* version of the UNEP approved map. For processing that simplification we use
[MapShaper](https://github.com/mbloch/mapshaper).

Assuming you have access to `Country_Polygon.json`, move to the folder where you have the file and execute:

```bash
docker run \
    --rm \
    --volume "$(pwd):/data" \
    --workdir /data \
    --entrypoint /usr/local/bin/mapshaper \
    akvo/akvo-mapshaper:20210405.085951.20f9d8d \
    -i Country_Polygon.json snap -simplify percentage=0.05 keep-shapes -o unep-gpml.topo.json format=topojson
```

We run the `mapshaper` command line version with the proper arguments. This will generate a
simplified file (`unep-gpml.topo.json`) in [TopoJSON](https://github.com/topojson/topojson) format.


## Seed Dummy Data

Dummy data is used for UI test with live data and to simplify the process of account registration.

```clojure
(:require [duct.core :as duct]
          [gpml.seeder.dummy :as dummy]
          [integrant.core :as ig])

(defn- dev-system
  []
  (-> (duct/resource "gpml/config.edn")
      (duct/read-config)
      (duct/prep-config [:duct.profile/dev])))

(def db (-> (dev-system)
              (ig/init [:duct.database.sql/hikaricp])
              :duct.database.sql/hikaricp
              :spec))

  ;; Create New Account as Admin
  (get-or-create-profile db "test@akvo.org" "Testing Profile" "ADMIN" "APPROVED")
  ;; Create New Account as Unapproved user
  (get-or-create-profile db "anothertest@akvo.org" "Another Testing" "USER" "SUBMITTED")

  ;; Create New Admin Account or Get Account
  ;; Then create unapproved dummy events with the account
  (submit-dummy-event db "test@akvo.org" "Testing Profile")
```
For further detail, please check: [dummy.clj](https://github.com/akvo/unep-gpml/blob/6698da2c9fbac2679ec54a5998860d67f064f578/backend/dev/src/gpml/seeder/dummy.clj) file


## Generate Countries List & Id Mapping 

To generate countries list & id mapping, we need to have this two files:
* `./frontend/public/unep-gpml.topo.json`
* `./backend/dev/resources/files/countries.json` (the old countries list)

Then from the root folder `./unep-gpml/` execute:

```bash
docker run \
    --rm \
    --volume "$(pwd):/data" \
    --workdir /data \
    amancevice/pandas:1.2.4-alpine \
    python ./doc/countries.py
```

That command will generate two files:
* `./backend/dev/resources/files/new_countries.json`
* `./backend/dev/resources/files/new_countries_mapping.json`

