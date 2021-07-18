void setBuildStatus(String message, String state) {
    step([
        $class: "GitHubCommitStatusSetter",
        reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/hilma-tech/jenkins-git-project-examp.git"],
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
                sh """
                docker build -t hello-there .
                """
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
         
  
