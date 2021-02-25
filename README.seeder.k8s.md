Running the seeder from the developer boxes take 30 to several hours, depending on where you are located.

Running the seeder from Kubernetes avoids the network trips and takes about one minute.

The current implementation idea is:
1. Deploy a container to the test or prod Kubernetes cluster that does nothing.
2. Connect to the container, and:
    3. Checkout this project from git.
    4. Run script to run the seeder
    5. Run script to approve and make an admin of the first user.
3. Exit and delete container    

To start the container:
1. Ensure that your `kubectl` is pointing to the correct cluster
2. Run: `kubectl apply -f ci/k8s/seeder.yaml`

Once is running:

```
kubectl exec -it $(kubectl get pods -l "run=unep-gpml-seeder" -o jsonpath="{.items[0].metadata.name}") bash
```

That will give you a shell inside the container. 

On a new container, you need a one off setup:

```
apt-get update && apt-get -qq install -y --no-install-recommends --no-install-suggests git
git clone https://github.com/akvo/unep-gpml.git
```

After this, or if the container was already running:

```
cd unep-gpml/backend/
lein with-profile seeder run run-seeder
```

Right now the seeder wipes the stakeholders, after the first user has signed up, you need to manually make him admin:

```
lein with-profile seeder run run-seeder set-admin <the-user-email>
```

## Data updates

If there is some update in the data files, you can just `git pull` in the existing container to pick up the changes and then
run the seeder again.

## Clean up

Run `kubectl delete -f ci/k8s/seeder.yaml` to delete the container.