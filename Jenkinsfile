pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                    url: 'https://github.com/Alostwayfarer/DNS-Capstone',
                    branch: "${BRANCH_NAME}"
            }
        }

        stage('Build Docker') {
            steps {
                script {
                    def imageName
                    switch(BRANCH_NAME) {
                        case 'frontend':
                            imageName = "frontend"
                            dockerfilePath = "./frontend/Dockerfile"
                            break
                        case 'client-api':
                            imageName = "client-api"
                            dockerfilePath = "./api/Dockerfile"
                            break
                        case 'reverse-proxy':
                            imageName = "reverse-proxy"
                            dockerfilePath = "./proxy/Dockerfile"
                            break
                        default:
                            error("Branch ${BRANCH_NAME} not configured for build")
                    }
                    
                    sh """
                        echo 'Building Docker Image for ${BRANCH_NAME}'
                    """
                }
            }
        }
    }
}