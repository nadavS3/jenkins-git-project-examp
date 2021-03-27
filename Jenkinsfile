pipeline {
     agent { label 'master' }
    stages {
        stage('Build') {
            steps {
                sh 'echo "Hello World"'
                sh '''
                    npm i
                    npm run build
                '''
            }
        }
    }
      post { 
        failure { 
            echo 'I failed the build!'
        }
    }
     post { 
        success { 
            echo 'the build was successfull!'
        }
    }
}
