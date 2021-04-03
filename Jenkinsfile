pipeline {
     agent { label 'master' }
    stages {
        stage('Build on master') {
            steps {
                sh 'echo "Hello World from master"'
            }
        }
    }
     agent{label 'nadavs-leptop'}
     stage('Build on master') {
            steps {
                sh 'echo "Hello World from master"'
            }
        }
    }
     
}
