export default ({ packageName }: { packageName: string }): string => {
  return `#!/bin/bash

echo "[${packageName}]Enter publish version: "
read VERSION

read -p "Publishing - are you sure? (y/n)" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Publishing $VERSION ..."
  # build
  #git checkout master
  VERSION=$VERSION npm run build

  echo "Changing NPM ver"
  npm version $VERSION
  
  echo "Add files to Git"
  git add *

  echo "Going to commit"
  git commit -m "v$VERSION"

  echo "Going to tagging"
  git tag -a v$VERSION -m "v$VERSION"

  echo "Now push to Git"
  git push origin master

  echo "Push tag to remote"
  git push origin "v$VERSION"

  echo "Finally publish to NPM"
  npm publish
fi
`;
};
