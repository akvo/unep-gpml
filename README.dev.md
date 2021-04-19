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
