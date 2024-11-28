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
                sh"aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 311141548911.dkr.ecr.ap-south-1.amazonaws.com"
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
                        def currentBuildNumber = env.BUILD_NUMBER.toInteger()
                    
                        // Perform subtraction
                        def adjustedBuildNumber = currentBuildNumber - 30
                        
                        // Handle cases where BUILD_NUMBER is less than 30
                        if (adjustedBuildNumber < 0) {
                            adjustedBuildNumber = 0
                        }
                        // dockerimage = docker.build( "311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api"+":${BUILD_NUMBER}", "./client-api")
                        sh "docker build -t client-api:${adjustedBuildNumber} ./client-api"

                        echo "build complete for client"

                        sh "docker tag client-api:${adjustedBuildNumber} 311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api:${adjustedBuildNumber}"
                        sh "docker push 311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api:${adjustedBuildNumber}"
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
                        // dockerimage = docker.build( app_frontend_Registry, "./front-deadend") : useful, will work too
                        sh "docker build -t dns-deploy ./front-deadend"
                        echo "build complete for frontend"
                        sh "docker push 311141548911.dkr.ecr.ap-south-1.amazonaws.com/dns-deploy:latest"
                        sh "docker tag dns-deploy:latest 311141548911.dkr.ecr.ap-south-1.amazonaws.com/dns-deploy:latest"
                        echo "docker push complete for frontend"

                    }
                }
            }

            stage('Deploy to ECS'){
                steps{
                    sh 'aws ecs update-service --cluster DNS --service backend-service --force-new-deployment'
                }
            }
        }
    }


