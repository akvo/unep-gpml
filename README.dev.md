## Running seeder code as Kubernetes Job

Check the code in [ci/k8s/seeder.yaml] and modify the option you want to execute:

* `set-admin` (this one requires an email address to be approved and set as admin)
* `run-seeder`

See the code at [backend/dev/seeder.clj]

Generate a unique name by using a timestap prefix in the job name

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
