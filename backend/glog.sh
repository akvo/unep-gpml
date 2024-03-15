# usage: glog.sh "test"|"production" "2024-03-14T13:00:00Z" "2024-03-14T13:06:00Z"
# returns the logs as JSON between two timestamps.
# it's used in dev.clj.
gcloud --quiet --verbosity=none logging read "timestamp>=\"$2\" timestamp<=\"$3\" AND resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"$1\" AND resource.labels.namespace_name=\"default\" AND resource.labels.container_name=\"backend\"" --format=json
