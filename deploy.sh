#!/bin/bash
git add *
git commit -m "$1"
git push
ssh root@fsmsh.com ./deploy_inail.sh
