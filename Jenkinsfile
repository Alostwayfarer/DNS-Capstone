pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        registryCredential = 'ecr:ap-south-1:aws_creds_dns'
        app_client_Registry = "client-api"
        RegistryURL = "https:311141548911.dkr.ecr.ap-south-1.amazonaws.com/"
        app_frontend_Registry = "dns-deploy"
    }
    
    stages {
        stage('Initialize') {
            steps {
                sh "aws configure list"
                echo "Building the app"
            
        }
        }
        
        stage('Build client-api') {
            when {
                branch 'client-api'
            }
                steps {
                    script {
                        // dockerimage = docker.build( app_client_Registry, "./client-api")
                        sh "docker build -t client-api ./client-api"

                        echo "build complete for client"

                        sh "docker tag client-api:latest 311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api:latest"
                        sh "docker push 311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api:latest"
                        echo "docker push complete for client-api"

                    
                }
            }
        }
        stage('Build frontend') {
            when {
                branch 'frontend'
            }
                steps {
                    script {
                        // dockerimage = docker.build( app_frontend_Registry, "./front-deadend")
                        sh "docker build -t dns-deploy ./front-deadend"
                        echo "build complete for frontend"
                        sh "docker push 311141548911.dkr.ecr.ap-south-1.amazonaws.com/dns-deploy:latest"
                        sh "docker tag dns-deploy:latest 311141548911.dkr.ecr.ap-south-1.amazonaws.com/dns-deploy:latest"
                        echo "docker push complete for frontend"

                        
                    }
                }
            }
        }
    }


