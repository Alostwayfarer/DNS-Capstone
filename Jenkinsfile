pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        registryCredential = 'ecr:ap-south-1:aws_creds_dns'
        app_client_Registry = "http://311141548911.dkr.ecr.ap-south-1.amazonaws.com/client-api"
        RegistryURL = "https:311141548911.dkr.ecr.ap-south-1.amazonaws.com/"
        app_frontend_Registry = "http://311141548911.dkr.ecr.ap-south-1.amazonaws.com/dns-deploy"
    }
    
    stages {
        stage('Initialize') {
            steps {
                echo "Building the app"
            }
        }
    }
}

//         stage('Build') {
//             when {branch 'client-api'}
//                 steps {
//                     script {
//                         dockerimage = docker.build( app_client_Registry + "${BRANCH_NAME}", "./client-api")
//                     }
//                 }
            
//             when branch 'frontend'{
//                 steps {
//                     script {
//                         dockerimage = docker.build( app_frontend_Registry + "${BRANCH_NAME}", "./frontend")
//                     }
//                 }
//             }

//         }
//         stage('Push') {
//             when branch 'client-api'{
//                 steps {
//                     script {
//                         docker.withRegistry(RegistryURL, registryCredential) {
//                             dockerimage.push("${BRANCH_NAME}")
//                             dockerimage.push('latest')
//                         }
//                     }
//                 }
//             }
//             when branch 'frontend'{
//                 steps {
//                     script {
//                         docker.withRegistry(RegistryURL, registryCredential) {
//                             dockerimage.push("${BRANCH_NAME}")
//                             dockerimage.push('latest')

//                         }
//                     }
//                 }
//             }
//         }
//     }
// }