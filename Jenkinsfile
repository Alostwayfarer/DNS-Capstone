pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        registryCredential = 'ecr:ap-south-1:aws_creds_dns'
        CLIENT_REGISTRY = "311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api "
        clientRegistryURL = "https://311141548911.dkr.ecr.ap-south-1.amazonaws.com/"
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
            // steps{
            //     script{
            //         // echo"biudling ${client_registry} : ${BUILD_NUMBER}"
            //         // def client_registry = "311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api"
            //         // def imageName = "${client_registry}:${BUILD_NUMBER}"
            //         // dockerImage = docker.build(imageName, "./client-api")
            //         // // sh "docker tag ${imageName} ${client_registry}:latest"
            //         // sh "docker push ${client_registry}:latest"
            //         // dockerImage= docker.build(client_registry + ":${BUILD_NUMBER}", "./client-api")
            //     }
            // }
                steps {
                    script {
                        def currentBuildNumber = env.BUILD_NUMBER.toInteger()
                    
                        // Perform subtraction
                        def adjustedBuildNumber = currentBuildNumber - 30
                        
                        // Handle cases where BUILD_NUMBER is less than 30
                        if (adjustedBuildNumber < 0) {
                            adjustedBuildNumber = 0
                        }
                    def imageTag = adjustedBuildNumber.toString()
                    
                    echo "Original BUILD_NUMBER: ${currentBuildNumber}"
                    echo "Adjusted BUILD_NUMBER (BUILD_NUMBER - 30): ${imageTag}"
                    
                    // Build the Docker image with the adjusted tag
                    sh """
                        docker build -t client-api:${imageTag} ./client-api
                    """
                    
                    // Tag the image with the ECR repository URL and adjusted build number
                    sh """
                        docker tag client-api:${imageTag} ${env.CLIENT_REGISTRY}:${imageTag}
                    """
                    
                    // Tag the image as latest
                    sh """
                        docker tag client-api:${imageTag} ${env.CLIENT_REGISTRY}:latest
                    """
                    
                    echo "Docker image built and tagged with ${imageTag} and latest."
                    
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

        // stage('Push to ECR') {
        //     steps {
        //         script {
        //             docker.withRegistry(clientRegistryURL, registryCredential) {
        //                 dockerImage.push("${BUILD_NUMBER}")
        //                 dockerImage.push("latest")
        //             }
        //         }
        //     }
        // }
        stage('Push client-api') {
            when {
                branch 'client-api'
            }
            steps {
                script {
                    // Define the image tags
                    def buildNumberTag = (env.BUILD_NUMBER.toInteger() - 30) < 0 ? "0" : "${env.BUILD_NUMBER.toInteger() - 30}"
                    def latestTag = "latest"
                    
                    echo "Pushing Docker image with tag: ${buildNumberTag}"
                    echo "Pushing Docker image with tag: ${latestTag}"
                    
                    // Push the Docker image with the adjusted build number tag
                    sh """
                        docker push ${env.CLIENT_REGISTRY}:${buildNumberTag}
                    """
                    
                    // Push the Docker image with the latest tag
                    sh """
                        docker push ${env.CLIENT_REGISTRY}:${latestTag}
                    """
                    
                    echo "Docker images pushed successfully with tags: ${buildNumberTag} and ${latestTag}."
                }
            }
        }

        // stage('Deploy to ECS'){
        //     steps{
        //         sh 'aws ecs update-service --cluster DNS --service backend-service --force-new-deployment'
        //     }
        // }
        post {
            always {
                // Optional: Clean up Docker images to save space
                sh "docker rmi client-api:${env.ADJUSTED_BUILD_NUMBER} ${env.CLIENT_REGISTRY}:${env.ADJUSTED_BUILD_NUMBER} ${env.CLIENT_REGISTRY}:latest || true"
            }
        }
    }
}


