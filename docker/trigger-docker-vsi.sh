#!bin/bash/
RED='\033[1;31m'
NC='\033[0m' # No Color

usage()
{
  echo -e "Triggers the 'vsi' docker image build."
  echo -e "Usage: $0 [options]"
  echo -e "    -h, --help\t\t\tDisplay help"
  echo -e "\t--token [ACCESS_TOKEN]\tTravis access token"
  echo -e "\t--tag [TAG]\t\tBuild tag"
  echo ""
}

parse()
{
  if [[ -z $1 ]]; then
    usage
    exit
  fi
  while [[ -n $1 ]]; do
      PARAM=`echo $1 | awk -F= '{print $1}'`
      VALUE=`echo $1 | awk -F= '{print $2}'`
      if [[ -z $VALUE ]]; then
        VALUE=$2
        if [[ -z $VALUE ]] || [[ $VALUE == -* ]]; then
          echo -e "${RED}ERROR: Missing value for parameter \"$PARAM\"${NC}"
          exit 1
        fi
        shift
      fi
      case $PARAM in
          -h | --help)
              usage
              exit
              ;;
          --token)
              TOKEN=$VALUE
              ;;
          --tag)
              TAG=$VALUE
              ;;
          *)
              echo -e "${RED}ERROR: Unknown parameter \"$PARAM\"${NC}"
              exit 1
              ;;
      esac
      shift
  done
}

parse $*

VSI_TAG="latest"
if [[ $TAG =~ ^v([0-9.]+-*[a-zA-Z0-9]*) ]]; then
    VSI_TAG=${BASH_REMATCH[1]};
fi

OWNER="vscode-icons"
REPO="docker"
REPO_SLUG_URLENCODED="$OWNER%2F$REPO"
BODY='{
  "request": {
    "message": "Triggering build of vsi:'$VSI_TAG'",
    "branch": "master",
    "config": {
      "env": {
        "VSI_TAG": "'$VSI_TAG'"
      }
    }
  }
}'
echo "$BODY"
echo ""
curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token $TOKEN" \
   -d "$BODY" \
   https://api.travis-ci.org/repo/$REPO_SLUG_URLENCODED/requests
