pipeline {
    agent any
    tools {
        nodejs "20.18.1"
    }
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        registryCredential = 'ecr:ap-south-1:aws_creds_dns'
        CLIENT_REGISTRY = "311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api"
        clientRegistryURL = "https://311141548911.dkr.ecr.ap-south-1.amazonaws.com/"
        app_frontend_Registry = "dns-deploy"
    }
    
    stages {
        stage('Initialize') {
            steps {
                sh"aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 311141548911.dkr.ecr.ap-south-1.amazonaws.com"
                sh "aws configure list"
                echo "Building the app"
                sh "npm --version"
            }
        }

        stage('Test client-api') {
            when {
                branch 'client-api'
                         }
            steps {
                    dir('client-api') {
                        sh 'npm install && npm test'
                        }
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
        stage('Deploy to ECS'){
            when {
                branch 'client-api'
            }
            steps{
                sh 'aws ecs update-service --cluster DNS --service client-api --force-new-deployment'
            }
        }
    }
    post {
            always {
                // Optional: Clean up Docker images to save space
                sh "docker rmi ${env.CLIENT_REGISTRY}:${env.ADJUSTED_BUILD_NUMBER} ${env.CLIENT_REGISTRY}:latest || true"
            }
               success {
script{
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelinestatus = currentBuild.result  ?:"UKNOWN"
                // def color = pipelinestatus.toLowerCase() == 'success' ? 'green' : 'red'
                def body = """ 
                <html>
                    <body>
                        <div style="border: 4px solid green; padding: 10x ">
                            <h2>${jobName} - Build ${buildNumber}</h2>
                            <div style="background-color: green; padding: 10x;">
                                <h3 style="color: white;"> Pipeline status : ${pipelinestatus} and ${currentBuild.result} </h3>
                            </div>
                            <p> check Build logs : <a href="${env.BUILD_URL}">HERE</a> </p>
                        </div>
                    </body>
                </html>
                """

                emailext (attachLog: true, body: body, compressLog: true, subject: "${jobName} - Build ${buildNumber} - ${currentBuild.result} ", to: 'genaidikshant@gmail.com', mimeType: 'text/html')
            }
        
        }
        failure {
            // emailext attachLog: true, body: 'this is test ', compressLog: true, subject: 'this is test email', to: 'genaidikshant@gmail.com'
            // echo "This will run only if failed"
            script{
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelinestatus = currentBuild.result  ?:"UKNOWN"
                // def color = pipelinestatus.toLowerCase() == 'success' ? 'green' : 'red'
                def body = """ 
                <html>
                    <body>
                        <div style="border: 4px solid red; padding: 10x ">
                            <h2>${jobName} - Build ${buildNumber}</h2>
                            <div style="background-color: red; padding: 10x;">
                                <h3 style="color: white;"> Pipeline status : ${pipelinestatus} and ${currentBuild.result} </h3>
                            </div>
                            <p> check Build logs : <a href="${env.BUILD_URL}">HERE</a> </p>
                        </div>
                    </body>
                </html>
                """

                emailext (attachLog: true, body: body, compressLog: true, subject: "${jobName} - Build ${buildNumber} - ${currentBuild.result} ", to: 'genaidikshant@gmail.com', mimeType: 'text/html')
            }
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

