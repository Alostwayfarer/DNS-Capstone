pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        registryCredential = 'ecr:ap-south-1:aws_creds_dns'
        app_client_Registry = "client-api"
        FRONTEND_REPOSITORY="311141548911.dkr.ecr.ap-south-1.amazonaws.com/frontend"
        RegistryURL = "https:311141548911.dkr.ecr.ap-south-1.amazonaws.com/"
        SERVICE_NAME= "frontend"
    }
    
    stages {
        stage('Initialize') {
            steps {
                sh "aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 311141548911.dkr.ecr.ap-south-1.amazonaws.com"
                echo "loginn"
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
                        // def currentBuildNumber = 
                    
                        // Perform subtraction
                        def adjustedBuildNumber = env.BUILD_NUMBER.toInteger() - 43
                        
                        // Handle cases where BUILD_NUMBER is less than 30
                        if (adjustedBuildNumber < 0) {
                            adjustedBuildNumber = 0
                        }
                    def imageTag = adjustedBuildNumber.toString()
                      // Convert back to string for tagging
                    env.ADJUSTED_BUILD_NUMBER = adjustedBuildNumber.toString()
            
                    
                    // echo "Original BUILD_NUMBER: ${currentBuildNumber}"
                    echo "Adjusted BUILD_NUMBER (BUILD_NUMBER - 30): ${imageTag}"
                    
                    // Build the Docker image with the adjusted tag
                    sh """
                        docker build -t ${env.CLIENT_REGISTRY}:${imageTag} ./client-api
                    """
                    
                    // Tag the image with the ECR repository URL and adjusted build number
                    sh """
                        docker tag ${env.CLIENT_REGISTRY}:${imageTag} ${env.CLIENT_REGISTRY}:${imageTag}
                    """
                    
                    // Tag the image as latest
                    sh """
                        docker tag ${env.CLIENT_REGISTRY}:${imageTag} ${env.CLIENT_REGISTRY}:latest
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
                    // script {
                    //     // dockerimage = docker.build( app_frontend_Registry, "./front-deadend") : useful, will work too
                    //     // sh "docker build -t frontend:${BUILD_NUMBER} ./frontend"
                    //     // echo "build complete for frontend"
                    //     // sh "docker tag frontend:${BUILD_NUMBER} 311141548911.dkr.ecr.ap-south-1.amazonaws.com/frontend:${BUILD_NUMBER}"
                    //     // sh "docker push 311141548911.dkr.ecr.ap-south-1.amazonaws.com/frontend:${BUILD_NUMBER}"
                    //     // echo "docker push complete for frontend"
                    // }
                script{
                        def adjustedBuildNumber = env.BUILD_NUMBER.toInteger() - 12
                        
                        // Handle cases where BUILD_NUMBER is less than 30
                        if (adjustedBuildNumber < 0) {
                            adjustedBuildNumber = 0
                        }
                        def imageTag = adjustedBuildNumber.toString()
                        // Convert back to string for tagging
                        env.ADJUSTED_BUILD_NUMBER = adjustedBuildNumber.toString()

                               // echo "Original BUILD_NUMBER: ${currentBuildNumber}"
                    echo "Adjusted BUILD_NUMBER (BUILD_NUMBER - 30): ${imageTag}"
                    

                    sh """
                        docker build -t ${FRONTEND_REPOSITORY}:${imageTag} ./frontend
                    """
                    sh """
                        docker tag ${FRONTEND_REPOSITORY}:${imageTag} ${FRONTEND_REPOSITORY}:${imageTag}
                    """

                    sh """ 
                    docker tag ${FRONTEND_REPOSITORY}:${imageTag} ${FRONTEND_REPOSITORY}:latest
                    """

                        echo "Docker image built and tagged with ${imageTag} and latest."
                    
                }
            }
        }


        stage('Push client-api') {
            when {
                branch 'client-api'
            }
            steps {
                script {
                    // Define the image tags
                    def buildNumberTag = env.BUILD_NUMBER.toInteger() - 43
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



        stage('Push frontend') {
            when {
                branch 'frontend'
            }
            steps {
                script {
                    // Define the image tags
                    def buildNumberTag = env.BUILD_NUMBER.toInteger() - 12
                    def latestTag = "latest"
                    
                    echo "Pushing Docker image with tag: ${buildNumberTag}"
                    echo "Pushing Docker image with tag: ${latestTag}"
                    
                    // Push the Docker image with the adjusted build number tag
                    sh """
                        docker push ${FRONTEND_REPOSITORY}:${buildNumberTag}
                    """
                    
                    // Push the Docker image with the latest tag
                    sh """
                        docker push ${FRONTEND_REPOSITORY}:${latestTag}
                    """
                    
                    echo "Docker images pushed successfully with tags: ${buildNumberTag} and ${latestTag}."
                }
            }
        }


        stage('Deploy to ECS'){
            when {
                branch 'client-api'
            }
            steps{
                    sh 'aws ecs update-service --cluster DNS --service backend-service --force-new-deployment'
                }
            } 
        stage('Deploy frontend to ECS'){
            when {
                branch 'frontend'
            }
            steps{
                    sh 'aws ecs update-service --cluster DNS --service frontend --force-new-deployment'
                }
            }
        }

    post {
        always {
            sh " docker rmi $(docker images -q) -f "
        }
        success {
            echo "This will run only if successful"
        }
        failure {
            echo "This will run only if failed"
        }
        unstable {
            echo "This will run only if the run was marked as unstable"
        }
        changed {
            echo "This will run only if the state of the Pipeline has changed"
            echo "For example, if the Pipeline was previously failing but is now successful"
        }
    }
    }


