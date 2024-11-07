pipeline{
    agent any
    stages {
        stage('hello') {
            steps {
                echo "Building the app"
            }
        }
        stage('depp'){
            when { 
                branch "deployment"                
        }
        steps {
                echo "Preparing for deployment"
            }

     }
    }
}