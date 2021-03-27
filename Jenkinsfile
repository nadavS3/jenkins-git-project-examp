pipeline {
     agent { label 'master' }
    stages {
        stage('Build') {
            steps {
                sh 'echo "Hello World"'
                sh '''
                    npm run build
                '''
            }
        }
    }
}
