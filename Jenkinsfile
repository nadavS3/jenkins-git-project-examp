void setBuildStatus(String message, String state) {
    step([
        $class: "GitHubCommitStatusSetter",
        reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/my-org/my-repo"],
        contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
        errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
        statusResultSource: [$class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]]]
    ]);
}


pipeline
{
    agent none
    stages
    {
        stage('Build on master')
        {
            agent { label 'master' }
            steps
            {
                sh 'echo "Hello World from master"'
                sh 'npm i'
                script{
                    def buildResults = sh 'npm run build'
                    if (buildResults == 'Failed') {
                        error "build failed"
                    }
                }
            }
        }
        stage('Build on nadavs leptop')
        {
            agent { label 'nadavs-leptop' }
            steps
            {
                sh 'echo "build was successfull"'
            }
        }
    }
    post {
        success {
            setBuildStatus("Build succeeded", "SUCCESS");
        }
        failure {
            setBuildStatus("Build failed", "FAILURE");
        }
    }
}
         
  
