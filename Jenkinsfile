pipeline 
{
     environment {
   
    buildResults = "0"
  }
    agent none
    stages
    {
        
        stage('Build on master')
          {
            agent {label 'master'}   
            steps
               {
                sh 'echo "Hello World from master"'
                sh 'npm i'
                sh 'npm run build'
                
                
               }
          }
        post
        {
             success {
            echo "build was good"
            buildResults = "1"
        }
        failure {
            echo "build faild"
        }
        }
         stage('Build on nadavs leptop')
         {
             when
             {
                expression { buildResults == "1" }
             }
             agent {label 'nadavs-leptop'}   
              steps
              {
                  sh 'echo "build was successfull"'
              }
         }
     }
       
}
