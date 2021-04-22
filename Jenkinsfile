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
                echo "nadav"
                echo "the reslt is ${currentBuild} "
                
                sh 'npm i'
                script
                {
                   try {
                       sh 'npm run build'
                    } catch (err) {
                    currentBuild.result = 'FAILURE'
                    echo err.getMessage()
                    }
                }
                   
                //sh 'echo "the reslt is  ${currentBuild.currentResult}" '
                echo "the reslt is ${currentBuild.currentResult} "
                
                echo "the reslt is ${currentBuild.currentResult} "
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
             
            setBuildStatus("Build failed", "FAILURE");
        }
    }
}
         
  
