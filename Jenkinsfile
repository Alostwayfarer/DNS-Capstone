pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from the provided GitHub repository
                git branch: 'deployment', url: 'https://github.com/Alostwayfarer/DNS-Capstone.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Navigate to the 'build-server-api' folder
                    dir('build-server api') {
                        // Build the Docker image from the Dockerfile in 'build-server-api'
                        sh 'docker build -t build-server-api-image .'
                    }
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Run the Docker container from the built image
                    sh 'docker run -d -p 3000:3000 build-server-api-image'
                }
            }
        }
    }

    post {
        success {
            echo 'Docker container is up and running!'
        }
        failure {
            echo 'Build or Docker run failed.'
        }
    }
}