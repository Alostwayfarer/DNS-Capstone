rsync -avz --exclude 'node_modules' --exclude '.git' \
-e "ssh -i ~/.ssh/buildServer-key.pem" \
. ubuntu@ip address :~/app
