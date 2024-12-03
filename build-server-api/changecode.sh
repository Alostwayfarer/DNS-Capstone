rsync -avz --exclude 'node_modules' --exclude '.git' \
-e "ssh -i ~/.ssh/buildServer-key.pem" \
. ubuntu@ec2-3-110-42-116.ap-south-1.compute.amazonaws.com:~/app
