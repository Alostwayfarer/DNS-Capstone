pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
                steps{
                        sh """ 
                        git clone https://github.com/Alostwayfarer/DNS-Capstone.git 
                        """
                }

            
        }

    }
}