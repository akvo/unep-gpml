MIGRATION_PATH="./resources/migrations/"

if [ -z "$1" ]
  then
    echo "No argument supplied"
    exit 0
fi
LAST_MGR=$(ls -l $MIGRATION_PATH |\
    tail -1 |\
    awk '{ s=""; for (i=9;i<=NF;i++) { s = s""$i }; print s}' |\
    cut -d '-' -f 1
)

NEW_MGR=$(expr ${LAST_MGR} + 1)
if [ ${NEW_MGR} -le "100" ]; then
    NEW_MGR=$(echo "0${NEW_MGR}")
elif [ ${NEW_MGR} -le "10"]; then
    NEW_MGR=$(echo "00${NEW_MGR}")
fi
NEW_MGR=$(echo "${NEW_MGR} $@" | sed 's/\ /\-/g')

for ud in "up" "down"
do
    touch "${MIGRATION_PATH}${NEW_MGR}.${ud}.sql"
    echo "CREATED ${NEW_MGR}.${ud}.sql"
done
