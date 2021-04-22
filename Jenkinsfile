void setBuildStatus(String message, String state) {
    step([
        $class: "GitHubCommitStatusSetter",
        reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/nadavS3/jenkins-git-project-examp.git"],
        contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
        errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
        statusResultSource: [$class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]]]
    ]);
}


pipeline
{
    agent any
    stages
    {
        stage('Build on master')
        {
            
            steps
            {
                sh 'echo the reslt is ${currentBuild.currentResult} '
                sh 'printenv'
                sh 'npm i'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    sh 'npm run build'
                } 
                //sh 'echo "the reslt is  ${currentBuild.currentResult}" '
                sh 'npm run build'
                //script{
                  //  def buildResults = sh 'npm run build'
                    //if (buildResults == 'Failed') {
                      //  error "build failed"
                    //}
                //}
            }
        }
    }
    post {
        
        success {
            setBuildStatus("Build succeeded", "SUCCESS");
        }
        failure {
            sh 'echo currentBuild.currentResult '
            setBuildStatus("Build failed", "FAILURE");
        }
    }
}
         
  
